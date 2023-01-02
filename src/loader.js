const YAML = require('yaml');
const fs = require('fs');
const { addMixin, removeMixin } = require('./mixin');
require('./utils');
require('./env');
require("dotenv").config({ path: "./.env" });
global.BrickRuntime = require('./brick/runtime');

const config = {};
const loadedModules = {}; // Stack of loaded modules to prevent recursive dependencies
const loadedMixins = {};

function getMixin(name) { // TODO: check circular requirements
	if (!loadedMixins[name]) {
		let mixin = require(`./${name}`);
		mixin._name = name;
		loadedMixins[name] = mixin;
	}
	return loadedMixins[name];

}

function getModuleConfig(modulePath) {
	let config = parseConfig(`./${modulePath}/_config.yaml`);
	assert(config, `No config found for module at ${modulePath}`);
	assert(config.moduleName === modulePath, `Error loading module at ${modulePath}: config.moduleName is ${config.moduleName}`);
	return config;
}

function loadModule(moduleConfig) {
	let modulePath = moduleConfig.moduleName;
	if (loadedModules[modulePath]) return; // Do not load modules twice
	loadedModules[modulePath] = {
		tests: []
	};
	objmerge(config, moduleConfig);
	env.log(`Loading module '${modulePath}'...`)
	if (config.requiredModules) { // TODO: check that all mixin requiredMixins entries are imported by required modules
		for (let requiredModulePath of Object.keys(config.requiredModules)) {
			requiredModuleConfig = getModuleConfig(requiredModulePath);
			loadModule(requiredModuleConfig);
		}
	}
	if (moduleConfig.tests) {
		for (let testName of Object.keys(moduleConfig.tests)) {
			loadedModules[modulePath].tests.push(`./${modulePath}/_tests/${testName}`);
		}
	}
}

function initClasses() {
	if (config.dwellers) {
		for (let [ dwellerName, dwellerConfig ] of Object.entries(config.dwellers)) {
			let dweller = {
				classname: dwellerName,
				mixins: {},
			};
			addMixin(dweller, getMixin('dweller/base')); // TODO: to config
			if (dwellerConfig.mixins) {
				for (let [ mixinName, mixinConfig ] of Object.entries(dwellerConfig.mixins)) {
					if (mixinConfig.requiredMixins) {
						for (let requiredMixinName of Object.keys(mixinConfig.requiredMixins)) {
							addMixin(dweller, getMixin(requiredMixinName));
						}
					}
					addMixin(dweller, getMixin(mixinName));
				}
			}
			global[dwellerName] = dweller;
		}
	}
}

function parseConfig(configPath) {
	const configYaml = fs.readFileSync(configPath, 'utf8');
	const config = YAML.parse(configYaml);
	return config;
}

async function runTests(tests, mask) {
	env.log('==================== TESTING ====================');
	const testEnv = require('./testEnv');
	let total = 0;
	let failed = 0;
	for (let testName of tests) {
		let { test, mixins } = require(`./${testName}`);
		if (mask && !testName.toLowerCase().includes(mask.toLowerCase())) continue;
		total++;
		env.log(`Running test: ${testName}`)
		if (mixins) {
			for (let testMixin of mixins) {
				addMixin(testMixin.dweller, testMixin.mixinConfig.master)
			}
		}
		try {
			await test(testEnv);
		} catch(e) {
			failed++;
			env.error(e);
		}
		if (mixins) {
			for (let testMixin of mixins) {
				removeMixin(testMixin.dweller, testMixin.mixinConfig.master)
			}
		}
		for (let core of cores) {
			core.delete();
		}
	}
	if (total === 0) {
		env.log('No tests found!');
		return;
	}

	env.log(`${total - failed} of ${total} tests passed`)
	if (failed === 0) {
		env.log('Tests passed!')
	} else {
		env.error('Test failed!')
	}
	process.exit()
}

const cores = [];
global.createCore = (data = {}) => {
	const core = Object.create(Core); //Creating core
	data.id = data.id ?? 'core';
	data.core = core;
	if (env.test && !data.virtualDb) {
		data.virtualDb = {};
	}
	core.inCreation = true;
	core.init(data);
	core.loadedModules = loadedModules;
	core.execAllMixins('onCreate', data);
	core.inCreation = false;
	cores.push(core);
	return core;
}

let testArg = process.argv.indexOf('--test');
if (testArg > -1) {
	env.test = true;
	var testMask = process.argv[testArg + 1]
}
process.chdir('./src');

let mainConfig = parseConfig('./config.yaml');
loadModule(mainConfig); // Loading modules from config
env.config = config;
initClasses();
env.log('All modules loaded');

let projectConfigs = [
	{
		fields: {
			db: 'paint_n_powder',
			game: {
				gameId: 'paint_n_powder'
			},
			pvpServer: true,
			engine: true,
			name: 'paint_n_powder'
		}
	}
]

if (env.test) {
	let tests = [];
	for (let loadedModule of Object.values(loadedModules)) {
		for (let testPath of loadedModule.tests) {
			tests.push(testPath);
		}
	}
	runTests(tests, testMask)
} else {
	let core = createCore({
		forge: true,
		httpServer: true,
		loader: true,
		solceryDb: 'solcery',
		// projectConfigs,
	});
	setInterval(() => core.tick(env.time()), 1000); // TODO: add try-catch
	setTimeout(() => matchLog(core), 1000);
}


const matchLog = async(core) => {

	const GameState = require('./project/pvpServer/match/gameState/gameState.js');
	console.log(GameState)
	env.log('test util running');
	let pnp = core.get(Project, 'paint_n_powder');
	let query = { 
		started: {
			$gt: env.time() - 86400000 * 14
		},
		finished: {
			$gt: 0
		}
	}
	let result = {};

	let matches = await pnp.gameDb.matches.find(query).toArray();
	for (let matchData of matches) {
		let matchResult = {};
		let { id, index } = matchData.players.find(p => !p.bot);
		matchResult.playerPubkey = id;

		let playerScore = matchData.result.playerScore[`${index}`];
		matchResult.result = playerScore ? 'VICTORY' : 'DEFEAT';
		


		let gameBuild = await pnp.gameDb.gameBuilds.findOne({ version: matchData.version })

		let gameState = new GameState({
			seed: matchData.seed,
			content: gameBuild.content.web,
			players: matchData.players,
		})

		let actionLog = matchData.actionLog;

		const gameLog = []
		let step = 0;
		for (let action of actionLog) {
			let { type, commandId, ctx, playerIndex, time } = action;
			gameState.time = time;
			switch (type) {
				case 'init':
					gameState.start(this.players);
					break;
				case 'gameCommand':
					gameState.applyCommand(commandId, ctx)
					break;
				default: 
					break;
			}
			step++;
			const shopPlaces = [ 37, 38, 39, 40, 41];
			let playerHp = gameState.attrs.your_hp;
			let botHp = gameState.attrs.enemy_hp;
			let cardsInShop = Object.values(gameState.objects).filter(obj => shopPlaces.includes(obj.attrs.place)).length;
			let cardsInShopDeck = Object.values(gameState.objects).filter(obj => obj.attrs.place === 15).length;
			gameLog.push({
				step,
				playerHp, 
				botHp,
				cardsInShopDeck,
				cardsInShop
			});
		}
		let fullHp = gameLog[gameLog.length - 1].playerHp === 20;
		let emptyShop = gameLog[gameLog.length - 1].cardsInShop === 0 && gameLog[gameLog.length - 1].cardsInShopDeck === 0;
		let playerHp = gameLog[gameLog.length - 1].playerHp;
		let cardsInShopDeck = gameLog[gameLog.length - 1].cardsInShopDeck;
		let cardsInShop = gameLog[gameLog.length - 1].cardsInShop;
		let sumDamage = 0;
		for (let i = 1; i < gameLog.length; i++) {
			let prev = gameLog[i-1];
			let current = gameLog[i];
			if (current.botHp < prev.botHp) {
				sumDamage += prev.botHp - current.botHp;
			}
		}
		matchResult = {
			...matchResult,
			fullHp,
			playerHp,
			emptyShop,
			sumDamage,
			cardsInShopDeck,
			cardsInShop,
		}

		result[matchData.id] = matchResult;
	}
	let resStr = ''
	for (let mr of Object.values(result)) {
		resStr += `${mr.playerPubkey}\t${mr.result}\t${mr.cardsInShop}+${mr.cardsInShopDeck}\n`;
	}
	console.log(resStr)
	// console.log(matches[0])
}