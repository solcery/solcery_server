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

