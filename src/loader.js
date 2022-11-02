const YAML = require('yaml');
const fs = require('fs');
const { addMixin, removeMixin } = require('./mixin');
require('./utils');
require('./env');
require("dotenv").config({ path: "./.env" });

const loadedModules = {};
const registeredMixins = {};
const registeredDwellers = {};
const registeredTests = [];

function loadMixin(name, config) { // TODO: check circular requirements
	if (!registeredMixins[name]) {
		let master = require(`./${name}`);
		master._name = name;
		registeredMixins[name] = {
			master,
			requiredMixins: [],
		}
	}
	if (typeof config !== 'object') return;
	let mixin = registeredMixins[name];
	if (config.requiredMixins) {
		for (let mixinName of Object.keys(config.requiredMixins)) {
			let requiredMixin = registeredMixins[mixinName];
			assert(requiredMixin);
			registeredMixins[name].requiredMixins.push(requiredMixin);
		}
	}
}

function getModuleConfig(modulePath) {
	let config = parseConfig(`./${modulePath}/_config.yaml`);
	assert(config, `No config found for module at ${modulePath}`);
	assert(config.moduleName === modulePath, `Error loading module at ${modulePath}: config.moduleName is ${config.moduleName}`);
	return config;
}

function loadModule(config) {
	let modulePath = config.moduleName;
	if (loadedModules[modulePath]) return; // Do not load modules twice
	env.log(`Loading module '${modulePath}'`)
	if (config.requiredModules) {
		for (let requiredModulePath of Object.keys(config.requiredModules)) {
			requiredModuleConfig = getModuleConfig(requiredModulePath)
			loadModule(requiredModuleConfig);
		}
	}
	if (config.dwellers) {
		for (let [ dwellerName, dwellerConfig ] of Object.entries(config.dwellers)) {
			if (!registeredDwellers[dwellerName]) {
				registeredDwellers[dwellerName] = {
					mixins: [ 'dweller/base' ],
				}
			};
			let dweller = registeredDwellers[dwellerName];
			dweller.id = dwellerConfig.id ?? dweller.id;
			if (dwellerConfig.mixins) {
				for (let [ mixinName, mixinConfig ] of Object.entries(dwellerConfig.mixins)) {
					loadMixin(mixinName, mixinConfig);
					dweller.mixins.push(mixinName)
				}
			}

		}
	}
	if (config.mixins) {
		for (let [ mixinName, mixinConfig ] of Object.entries(config.mixins)) {
			loadMixin(mixinName, mixinConfig);
		}
	}
	loadedModules[modulePath] = { 
		modulePath,
		config,
	};
	if (config.tests) {
		for (let testName of Object.keys(config.tests)) {
			let testPath = `${modulePath}/_tests/${testName}`;
			registeredTests.push(testPath);
		}
	}
}

function loadDwellers() {
	for (let [ dwellerName, dwellerConfig ] of Object.entries(registeredDwellers)) {
		let dweller = {
			classname: dwellerName,
			mixins: {}
		};
		for (let mixinName of dwellerConfig.mixins) {
			let mixinConfig = registeredMixins[mixinName];
			assert(mixinConfig);
			addMixin(dweller, mixinConfig);
		}
		global[dwellerName] = dweller;
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
				addMixin(testMixin.dweller, testMixin.mixinConfig)
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
				removeMixin(testMixin.dweller, testMixin.mixinConfig)
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
	core.init(data);
	core.loadedModules = loadedModules;
	core.execAllMixins('onCreate', data);
	cores.push(core);
	return core;
}

let testArg = process.argv.indexOf('--test');
if (testArg > -1) {
	env.test = true;
	var testMask = process.argv[testArg + 1]
}
process.chdir('./src');

let config = parseConfig('./config.yaml');
loadModule(config); // Loading modules from config
loadDwellers();
env.log('All modules loaded');

if (env.test) {
	runTests(registeredTests, testMask)
} else {
	let core = createCore({
		forge: true,
		httpServer: true,
		db: 'solcery',
	});
	setInterval(() => core.tick(env.time()), 1000); // TODO: add try-catch
}
