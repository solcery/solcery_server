import { defaultFilter } from '../base';
import { ValueRender } from './components';

class SEnum {
	static fromString = (data) => new SEnum({ titles: data.split('|') });
	constructor(data) {
		this.titles = data.titles;
		this.values = data.values ?? Array.from(data.titles.keys());
		this.titles.unshift('--NONE--');
		this.values.unshift(null);
	}
	construct = (value, meta) => value;
	valueRender = ValueRender;
	filter = defaultFilter;
	default = () => null;
	eq = (a, b) => a === b;
	clone = (a) => a;
}

export { SEnum };
