const { 
  v1: uuidv1,
} = require('uuid');

global.assert = (value, message = 'Assertion failed') => {
	if (value) return true;
	throw new Error(message);
}

global.objget = (obj, ...path) => {
	return path.reduce((acc, pathElement, idx) => {
		if (!acc) return undefined;
		if (!acc[pathElement]) return undefined;
		return acc[pathElement];
	}, obj);
}

global.objset = (obj, value, ...path) => {
	path.reduce((acc, pathElement, idx) => {
		if (idx < path.length - 1) {
			if (!acc[pathElement]) {
				acc[pathElement] = {};
			}
		} else {
			acc[pathElement] = value;
		}
		return acc[pathElement];
	}, obj);
}

global.objinsert = (obj, value, ...path) => {
	path.reduce((acc, pathElement, idx) => {
		if (idx < path.length - 1) {
			if (!acc[pathElement]) {
				acc[pathElement] = {};
			}
		} else {
			if (!acc[pathElement]) {
				acc[pathElement] = [];
			}
			acc[pathElement].push(value)
		}
		return acc[pathElement];
	}, obj);
}

global.objmerge = (target, source) => {
	const isObject = (obj) => obj && typeof obj === 'object';

	if (!isObject(target) || !isObject(source)) {
		return source;
	}

	Object.keys(source).forEach(key => {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			target[key] = targetValue.concat(sourceValue);
		} else if (isObject(targetValue) && isObject(sourceValue)) {
			target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
		} else {
			target[key] = sourceValue;
		}
	});
	return target;
}

global.uuid = uuidv1;
