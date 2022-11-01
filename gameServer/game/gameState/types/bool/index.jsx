import { defaultFilter } from '../base';
import { ValueRender } from './components';

class SBool {
	static fromString = () => new SBool();
	construct = (value, meta) => value;
	valueRender = ValueRender;
	filter = defaultFilter;
	default = () => false;
	eq = (a, b) => a === b;
	clone = (a) => a;
}

export { SBool };
