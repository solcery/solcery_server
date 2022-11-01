import { SType } from '../index';
import { ValueRender } from './components';

class SStruct {
	constructor(data) {
		this.fields = [];
		for (let field of data.fields) {
			let fld = { ...field };
			fld.type = SType.from(field.type);
			this.fields.push(fld);
		}
	}
	construct = (value, meta) => {
		let res = {};
		for (let field of this.fields) {
			if (value[field.code]) {
				res[field.code] = field.type.construct(value[field.code], meta);
			}
		}
		return res;
	};
	valueRender = ValueRender;
	default = () => {
		let res = {};
		for (let field of this.fields) {
			res[field.code] = field.type.default();
		}
		return res;
	};
	eq = (a, b) => {
		if (a === b) return true;
		if (a && !b) return false;
		if (b && !a) return false;
		for (let field of this.fields) {
			if (!field.type.eq(a[field.code], b[field.code])) return false;
		}
		return true;
	};
	clone = (value) => {
		if (!value) return {};
		let res = {};
		for (let field of this.fields) {
			if (value[field.code]) {
				res[field.code] = field.type.clone(value[field.code]);
			}
		}
		return res;
	};
}

export { SStruct };
