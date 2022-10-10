const YAML = require('yaml');
const fs = require('fs');
const { addMixin } = require('./dweller.js');
require('./utils');
require("dotenv").config({ path: "./config.env" });

const loadedModules = {}

function loadModule(modulePath) {
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
			loadModule(modulePath);
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
		config 
	};
}


function parseConfig(configPath) {
	const configYaml = fs.readFileSync(configPath, 'utf8');
	const config = YAML.parse(configYaml);
	return config;
}


loadModule('core'); // Loading core module

const core = Object.create(Core); //Creating core
core.id = 'core'
core.core = core;
core.loadedModules = loadedModules;
core.execAllMixins('onCreate')
