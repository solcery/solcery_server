const env = {};

env.time = function () {
	return Date.now();
}

env.log = function(...args) {
	console.log(...args);
}

env.error = function(...args) {
	console.error(...args);
}

global.env = env;
