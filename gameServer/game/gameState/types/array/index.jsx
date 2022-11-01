import { SType } from '../index';
import { ValueRender } from './components';

class SArray {
	static fromString = (data) => new SArray({ valueType: data });
	constructor(data) {
		this.valueType = SType.from(data.valueType);
	}
	construct = (value, meta) => value.map((val) => this.valueType.construct(val, meta));
	valueRender = ValueRender;
	default = () => [];
	eq = (a, b) => {
		if (a === b) return true;
		if (a && !b) return false;
		if (b && !a) return false;
		if (a.length !== b.length) return false;
		for (let i in a) {
			if (!this.valueType.eq(a[i], b[i])) return false;
		}
		return true;
	};
	clone = (value) => (value ? value.map((val) => this.valueType.clone(val)) : undefined);
}

export { SArray };
