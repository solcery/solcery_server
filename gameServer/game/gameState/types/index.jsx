import { SInt } from './int';
import { SString } from './string';
import { SBool } from './bool';
import { SEnum } from './enum';
import { SImage } from './image';
import { SArray } from './array';
import { SMap } from './map';
import { SLink } from './link';
import { SBrick } from './brick';
import { SDate } from './date';
import { SStruct } from './struct';
import { SSound } from './sound';

const _stypebyclassname = {
	SInt: SInt,
	SString: SString,
	SBool: SBool,
	SEnum: SEnum,
	SImage: SImage,
	SArray: SArray,
	SMap: SMap,
	SLink: SLink,
	SBrick: SBrick,
	SDate: SDate,
	SStruct: SStruct,
	SSound: SSound,
}

const fromObject = (src) => {
	let classConstructor = _stypebyclassname[src.name];
	if (!classConstructor) throw new Error('Error building stype from data!');
	return new classConstructor(src.data);
};

const fromString = (src) => {
	let fromIndex = src.indexOf('<') + 1;
	let toIndex = src.lastIndexOf('>');
	let name = src.replace(/ *<[^)]*> */g, '');
	let data = fromIndex > 0 ? src.substring(fromIndex, toIndex) : undefined;
	return _stypebyclassname[name].fromString(data);
};

export const SType = {
	register: (classname, constructor) => {
		_stypebyclassname[classname] = constructor;
	},

	from: (src) => {
		switch (typeof src) {
			case 'string':
				return fromString(src);
			case 'object':
				return fromObject(src);
			default:
				throw new Error('Unknown type definition from mongo');
		}
	},
};


