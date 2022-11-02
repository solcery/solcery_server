const env = {};

env.log = function(...args) {
	console.log(...args);
}

env.error = function(...args) {
	console.error(...args);
}

global.env = env;
