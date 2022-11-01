import { defaultFilter } from '../base';
import { ValueRender } from './components';
import { Template } from '../../template';

class SLink {
	static fromString = (data) => {
		let [ templateCode, field ] = data.split('|');
		return new SLink({ templateCode, field });
	}

	constructor(data) {
		this.templateCode = data.templateCode;
		this.field = data.field;
		this.project = data.project
		if (data.field && data.project) {
			throw new Error('Error reading SLink type: Cannot have both [project] and [field] properties!')
		}
	}

	validate = (value, meta) => {
		if (this.project) return true; //TODO: validate external links
		if (value === undefined) return;
		let obj = meta.content.objects.find(obj => obj._id === value);
		if (!obj) {
			meta.error(`Link to a deleted object [${value}]!`);
			return;
		}
		if (!obj.fields.enabled) {
			meta.error(`Link to a disabled object [${value}] ${obj.fields.name}!`);
			return;
		}
	};

	construct = (value, meta) => {
		if (this.project) return value;
		if (this.field) {
			let object = meta.content.objects.find(object => object._id === value && object.template === this.templateCode);
			if (!object) throw new Error('Error constructing link, no object');
			let schema = meta.content.templates.find(schema => schema.code === this.templateCode)
			if (!schema) throw new Error('Error constructing link, no schema');
			let template = new Template(schema)
			return template.fields[this.field].type.construct(object.fields[this.field], meta); //TODO
		}
		return meta.getIntId(value);
	};
	filter = defaultFilter;
	valueRender = ValueRender;
	default = () => undefined;
	eq = (a, b) => a === b;
	clone = (a) => a;
}

export { SLink };
