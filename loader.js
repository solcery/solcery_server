const YAML = require('yaml');
const fs = require('fs');
const { addMixin, removeMixin } = require('./dweller.js');
require('./utils');
require('./env');
require("dotenv").config({ path: "./config.env" });

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

function loadModule(modulePath) {
	if (loadedModules[modulePath]) return; // Do not load modules twice
	env.log(`Loading module '${modulePath}'`)
	let config = parseConfig(`./${modulePath}/_config.yaml`);
	if (config.requiredModules) {
		for (let [ modulePath, _ ] of Object.entries(config.requiredModules)) {
			loadModule(modulePath);
		}
	}
	if (config.dwellers) {
		for (let [ dwellerName, dwellerConfig ] of Object.entries(config.dwellers)) {
			if (!registeredDwellers[dwellerName]) {
				registeredDwellers[dwellerName] = {
					mixins: [],
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
			let testPath = `${modulePath}/tests/${testName}`;
			registeredTests.push(testPath);
		}
	}
}

function loadDwellers() {
	for (let [ dwellerName, dwellerConfig ] of Object.entries(registeredDwellers)) {
		let dweller = Object.create(Dweller);
		dweller.classname = dwellerName;
		dweller.mixins = {};
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
		for (let core of cores) {
			core.delete();
			global.cores = [];
		}
		if (mixins) {
			for (let testMixin of mixins) {
				removeMixin(testMixin.dweller, testMixin.mixinConfig)
			}
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


global.cores = [];
global.createCore = (data = {}) => {
	const core = Object.create(Core); //Creating core
	core.id = data.id ?? 'core';
	core.core = core;
	core.disabledMixins = {};
	core.loadedModules = loadedModules;
	cores.push(core);
	core.execAllMixins('onCreate', data);
	return core;
}

let testArg = process.argv.indexOf('--test');
if (testArg > -1) {
	env.test = true;
	var testMask = process.argv[testArg + 1]
}

loadModule('core'); // Loading core module
loadDwellers();
env.log('All modules loaded');

if (env.test) {
	runTests(registeredTests, testMask)
} else {
	env.log(registeredMixins);
	env.log(registeredDwellers);
	env.log(WSConnection);
	// createCore({
	// 	forge: true,
	// 	db: 'solcery',
	// });
}
