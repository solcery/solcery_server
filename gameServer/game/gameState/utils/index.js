function insertTable(table, value, ...path) {
	path.reduce((acc, pathElement, idx) => {
		if (idx < path.length - 1) {
			if (!acc[pathElement]) acc[pathElement] = {};
		} else {
			acc[pathElement] = value;
		}
		return acc[pathElement];
	}, table);
}

function getTable(table, ...path) {
	return path.reduce((acc, pathElement, idx) => {
		if (!acc) return undefined;
		if (!acc[pathElement]) return undefined;
		return acc[pathElement];
	}, table);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

module.exports = { insertTable, getTable };