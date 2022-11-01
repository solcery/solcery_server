import { insertTable } from '../../utils';
import { SType } from '../types';

export const paramFromMapEntry = (entry) => {
	return {
		code: entry.key,
		name: entry.key,
		type: SType.from(`SBrick<${entry.value}>`),
	};
};

export class BrickLibrary {
	bricks = {};

	addBrick(brickSignature) {
		let brick = Object.assign({}, brickSignature);
		brick.params = brickSignature.params.map((param) => {
			let newParam = Object.assign({}, param);
			if (typeof newParam.type === 'string') {
				newParam.type = SType.from(newParam.type);
			} else if (typeof newParam.type === 'object') {
				if (newParam.type.data && newParam.type.name) {
					newParam.type = SType.from(newParam.type);
				}
			}
			return newParam;
		});
		insertTable(this.bricks, brick, brick.lib, brick.func);
	}

	constructor(content) {
		const { basicActions } = require('./action');
		const { basicConditions } = require('./condition');
		const { basicValues } = require('./value');
		basicActions.forEach((brick) => this.addBrick(brick));
		basicConditions.forEach((brick) => this.addBrick(brick));
		basicValues.forEach((brick) => this.addBrick(brick));
		if (!content || !content.objects) return;
		let customBricks = content.objects
			.filter((obj) => obj.template === 'customBricks')
			.filter((obj) => obj.fields.enabled)
			.filter((obj) => obj.fields.brick && obj.fields.brick.brickTree)
			.map((obj) => {
				let params = [];
				if (obj.fields.brick.brickParams) {
					params = obj.fields.brick.brickParams.map((entry) => paramFromMapEntry(entry));
				}
				return {
					lib: obj.fields.brick.brickTree.lib,
					func: `custom.${obj._id}`,
					name: obj.fields.name,
					hidden: obj.fields.hidden,
					params,
				};
			});
		for (let customBrick of customBricks) {
			this.addBrick(customBrick);
		}
	}
}
