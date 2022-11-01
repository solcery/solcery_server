import { ValueRender } from './components';

class SDate {
	static fromString = (data) => new SDate({ time: data });
	constructor(data) {
		this.excludeTime = data.excludeTime;
	}

	valueRender = ValueRender;
	construct = (value, meta) => value;
	default = () => {
		let res = Date.now();
		if (this.excludeTime) {
			res.setHours(0, 0, 0, 0);
		}
		return res;
	};
	forceSortOrder = 'ascend'; //TODO remove
	sorter = (a, b) => {
		if (!a) return -1;
		if (!b) return 1;
		return a - b;
	};
	eq = (a, b) => a === b;
	clone = (a) => a;
}

export { SDate };
