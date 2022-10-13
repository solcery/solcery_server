const YAML = require('yaml');
const fs = require('fs');
const { addMixin, removeMixin } = require('./dweller.js');
require('./utils');
require("dotenv").config({ path: "./config.env" });

const loadedModules = {}

function loadModule(modulePath, test) {
	if (loadedModules[modulePath]) return; // Do not load modules twice
	console.log(`Loading module '${modulePath}'`)
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
				let mixinPath = `./${modulePath}/${mixinName}`
				let mixin = require(mixinPath);
				mixin._name = mixinPath;
				assert(global[dwellerName], `Error loading mixin ${mixinPath}: No dweller '${dwellerName}'!`)
				// console.log(`Dweller ${dwellerName}: adding mixin ${mixinPath}`);
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
			tests[testPath] = require(`./${testPath}`);;
		}
		loadedModules[modulePath].tests = tests;
	}
}

function parseConfig(configPath) {
	const configYaml = fs.readFileSync(configPath, 'utf8');
	const config = YAML.parse(configYaml);
	return config;
}

async function runTests(tests, mask) {
	console.log('==================== TESTING ====================');
	global.testContext = {
		addMixin
	}
	let total = 0;
	let failed = 0;
	for (let [ testName, { test, mixins } ] of Object.entries(tests)) {
		if (mask && !testName.toLowerCase().includes(mask.toLowerCase())) continue;
		total++;
		console.log(`Running test: ${testName}`)
		if (mixins) {
			for (let testMixin of mixins) {
				addMixin(testMixin.dweller, testMixin.mixin)
			}
		}
		try {
			await test();
		} catch(e) {
			failed++;
			console.error(e);
		}
		if (mixins) {
			for (let testMixin of mixins) {
				removeMixin(testMixin.dweller, testMixin.mixin)
			}
		}
	}
	if (total === 0) {
		console.log('No tests found!');
		return;
	}

	console.log(`${total - failed} of ${total} tests passed`)
	if (failed === 0) {
		console.log('Tests passed!')
	} else {
		console.error('Test failed!')
	}
	process.exit()
}


global.createCore = async () => {
	if (global['core']) {
		await global.core.delete();
	}
	const core = Object.create(Core); //Creating core
	core.id = 'core'
	core.core = core;
	core.loadedModules = loadedModules;
	await core.execAllMixins('onCreate')
	global['core'] = core;
	return core;
}

let testArg = process.argv.indexOf('--test');
if (testArg > -1) {
	var test = true;
	var testMask = process.argv[testArg + 1]
}

loadModule('core', test); // Loading core module
console.log('All modules loaded');

if (test) {
	let tests = {}
	for (let loadedModule of Object.values(loadedModules)) {
		if (loadedModule.tests) {
			Object.assign(tests, loadedModule.tests)
		}
	}
	runTests(tests, testMask)
} else {
	createCore();
}
