import { ValueRender, FilterRender } from './components';

const validateBrick = (v) => {
	if (v.func === 'error') return false;
	if (v === undefined) return true;
	for (let param of Object.values(v.params)) {
		if (param === null) return false;
		if (param.lib) {
			if (!validateBrick(param)) return false;
		}
	}
	return true;
};

export class SBrick {
	static fromString = (data) => new SBrick({ brickType: data });

	constructor(data) {
		this.brickType = data.brickType;
		this.params = data.params;

		if (!this.brickType) {
			this.filter = {
				eq: (value, filterValue) => {
					return value.brickType === filterValue;
				},
				render: FilterRender,
			};
		}
	}

	validate = (value, meta) => {
		if (value === undefined) return;
		let v = value;
		if (v.brickParams) v = v.brickTree;
		if (!v) return;
		let brickSignature = meta.brickLibrary[v.lib][v.func];
		if (!brickSignature) {
			meta.error(`No brick '${v.lib}.${v.func}'' found in brick library!`);
			return;
		}
		for (let paramSig of brickSignature.params) {
			let param = v.params[paramSig.code];
			if (param === undefined || param === null) {
				// TODO: undefined only
				meta.error(`No param '${paramSig.code}' found for brick '${v.lib}.${v.func}'!`);
			} else if (paramSig.type instanceof SBrick) {
				this.validate(param, meta);
			} else if (paramSig.type.validate) {
				paramSig.type.validate(param, meta);
			}
		}
	};

	validateField = (value) => {
		// client validation before saving
		if (value === undefined) return true;
		let v = value.brickTree;
		if (!v) return true;
		return validateBrick(v);
	};

	construct = (value, meta) => {
		if (value === undefined) return; //TODO: Общий обходчик бриков на констракт и validate
		let v = value;
		if (v.brickParams) v = v.brickTree;
		if (!v) return undefined;
		let brickSignature = meta.brickLibrary[v.lib][v.func];
		if (!brickSignature)
			throw new Error(
				`Error constructing object [${meta.object._id}]! Brick [${v.lib}.${v.func}] - no signature found!`
			);
		let result = {
			name: brickSignature.name,
		};
		let params = [];
		for (let paramSig of brickSignature.params) {
			let param = v.params[paramSig.code];
			if (param === undefined) {
				throw new Error(
					`Error constructing object [${meta.object._id}]! Brick [${v.lib}.${v.func}] - no param 'paramSig.code' found!`
				);
			}
			params.push({
				name: paramSig.code,
				value: paramSig.type.construct(param, meta),
			});
		}
		if (meta.target.includes('unity')) {
			let func = brickSignature.func;
			if (func.includes('custom')) {
				let typeByName = { action: 0, condition: 1, value: 2 };
				result.subtype = 10000 + meta.getIntId(func.split('.')[1]);
				result.type = typeByName[brickSignature.lib];
			} else {
				result.type = brickSignature.type;
				result.subtype = brickSignature.subtype;
			}
			result.params = params;
		}
		if (meta.target === 'web') {
			result.lib = brickSignature.lib;
			result.func = brickSignature.func;
			let func = brickSignature.func;
			if (func.includes('custom')) {
				result.func = 'custom.' + meta.getIntId(func.split('.')[1]);
			}
			let newParams = {};
			for (let param of params) {
				newParams[param.name] = param.value;
			}
			result.params = newParams;
		}
		return result;
	};
	valueRender = ValueRender;
	default = () => null;
	eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
	clone = (a) => {
		if (!a) return a;
		return JSON.parse(JSON.stringify(a));
	};
}

// export { SBrick };
