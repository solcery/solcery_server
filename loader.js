const YAML = require('yaml');
const fs = require('fs');
const { addMixin } = require('./dweller.js');
require('./utils');
require("dotenv").config({ path: "./config.env" });

const loadedModules = {}

function loadModule(modulePath, test) {
	if (loadedModules[modulePath]) return; // Do not load modules twice
	let config = parseConfig(`./${modulePath}/_config.yaml`);
	let { dwellers, requiredModules, mixins, api } = config;
	if (dwellers) {
		for (let [ dwellerName, dwellerConfig ] of Object.entries(dwellers)) {
			assert(!global.dwellerName, `Error parsing config for module ${modulePath}. Dweller ${dwellerName} already exists.`);
			global[dwellerName] = Object.create(Dweller);
			global[dwellerName].classname = dwellerName;
			global[dwellerName].callbacks = {};
		}
	}
	if (requiredModules) {
		for (let [ modulePath, _ ] of Object.entries(requiredModules)) {
			loadModule(modulePath, test);
		}
	}
	if (mixins) {
		for (let [ dwellerName, mixinList ] of Object.entries(mixins)) {
			for (let [mixinName, mixinProps] of Object.entries(mixinList)) {
				let mixin = require(`./${modulePath}/${mixinName}`);
				addMixin(global[dwellerName], mixin)
			}
		}
	}
	loadedModules[modulePath] = { 
		modulePath,
		config,
	};
	if (test && config.tests) {
		let tests = {}
		for (let testName of Object.keys(config.tests)) {
			let testPath = `${modulePath}/tests/${testName}`;
			let testFunc = require(`./${testPath}`);
			tests[testPath] = testFunc;
		}
		loadedModules[modulePath].tests = tests;
	}
}

function parseConfig(configPath) {
	const configYaml = fs.readFileSync(configPath, 'utf8');
	const config = YAML.parse(configYaml);
	return config;
}

function runTests(tests) {
	let total = 0;
	let failed = 0;
	for (let [ testName, testFunc ] of Object.entries(tests)) {
		total++;
		try {
			testFunc()
		} catch (e) {
			failed++;
			console.error(`Test '${testName}' failed: ${e.message}`)
		}
	}
	console.log(`${total - failed} of ${total} tests passed`)
	if (failed === 0) {
		console.log('Tests successfully passed!')
	} else {
		console.error('Test were not passed!')
	}
}

let test = process.argv.includes('--test');

loadModule('core', test); // Loading core module

if (test) {
	let tests = {}
	for (let loadedModule of Object.values(loadedModules)) {
		if (loadedModule.tests) {
			Object.assign(tests, loadedModule.tests)
		}
	}
	runTests(tests)
} else {
	const core = Object.create(Core); //Creating core
	core.id = 'core'
	core.core = core;
	core.loadedModules = loadedModules;
	core.execAllMixins('onCreate')
}
