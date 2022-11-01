import { ValueRender } from './components';
import { DefaultFilterRender } from '../base/components';

class SString {
	static fromString = () => new SString({});

	constructor(data) {
		this.useMacros = data.useMacros;
		this.isPrimaryTitle = data.isPrimaryTitle;
		this.width = data.width;
		this.textArea = data.textArea;
	}

	construct = (value, meta) => {
		if (!this.useMacros) return value;

		// Applying macros
		function applyLinkMacro(match, template, code) {
			let obj = meta.content.objects.find(obj => obj.fields.code === code && obj.template === template);
			if (!obj) return match;
			let intId = meta.getIntId(obj._id);
			return `<link="${intId}">`;
		}
		let res = value;
		for (let { source, result } of meta.stringMacros) {
			res = res.replaceAll(source, result);
		}
		res = res.replace(/<link=([a-zA-Z]+).([a-zA-Z0-9_]+)>/g, applyLinkMacro);
		return res;
	};

	valueRender = ValueRender;
	default = () => '';

	filter = {
		eq: (value, filterValue) => {
			if (value === undefined) return false;
			if (filterValue === undefined) return true;
			return value.toLowerCase().includes(filterValue.toLowerCase());
		},
		render: DefaultFilterRender,
	};

	sorter = (a, b) => {
		if (!a) a = '';
		if (!b) b = '';
		return a.localeCompare(b);
	};

	eq = (a, b) => {
		if (!a) a = '';
		if (!b) b = '';
		return a === b;
	};

	clone = (a) => a;
}

export { SString };
