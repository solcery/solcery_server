const YAML = require('yaml');
const fs = require('fs');
const { Dweller, addMixin } = require('./dweller.js');
require('./utils');

const loadedModules = {}

function loadModule(moduleName) {
	if (loadedModules[moduleName]) return; // Do not load modules twice
	let config = parseConfig(`./${moduleName}/_config.yaml`);
	let { dwellers, requiredModules, mixins } = config;
	if (dwellers) {
		for (let [ dwellerName, _ ] of Object.entries(dwellers)) {
			assert(!global.dwellerName, `Error parsing config for module ${moduleName}. Dweller ${dwellerName} already exists.`);
			global[dwellerName] = Object.assign({}, Dweller);
			global[dwellerName].callbacks = {};
		}
	}
	if (requiredModules) {
		for (let [ moduleName, _ ] of Object.entries(requiredModules)) {
			loadModule(moduleName);
		}
	}
	if (mixins) {
		for (let [ dwellerName, mixinList ] of Object.entries(mixins)) {
			for (let [mixinName, mixinProps] of Object.entries(mixinList)) {
				let mixin = require(`./${moduleName}/${mixinName}`);
				addMixin(global[dwellerName], mixin)
			}
		}
	}
	loadedModules[moduleName] = { config };
}


function parseConfig(configPath) {
	const configYaml = fs.readFileSync(configPath, 'utf8');
	const config = YAML.parse(configYaml);
	return config;
}


loadModule('core'); // Loading core module


const core = Object.create(Core); //Creating core
core.id = 'main'
core.core = core;
core.loadedModules = loadedModules;
// core.create(Api, { id: 1 })
core.execAllMixins('onCreate')
