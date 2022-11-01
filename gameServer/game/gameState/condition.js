// import { generic } from './runtime';

const generic = {
	arg: (runtime, params, ctx) => {
		var scope = ctx.scopes.pop();
		var result = runtime.execBrick(scope.args[params.name], ctx);
		ctx.scopes.push(scope);
		return result;
	}
};

const basicConditions = [
	{
		type: 1,
		subtype: 0,
		lib: 'condition',
		func: 'const',
		name: 'Constant',
		params: [
			{ code: 'value', name: 'Value', type: 'SBool' }, //TODO
		],
		exec: (runtime, params, ctx) => {
			return params.value;
		},
	},
	{
		lib: 'condition',
		func: 'error',
		name: 'ERROR',
		hidden: true,
		params: [{ code: 'data', name: 'Data', type: 'SString', readonly: true }],
		exec: () => {
			return false;
		},
	},
	{
		type: 1,
		subtype: 1,
		lib: 'condition',
		func: 'not',
		name: 'Not',
		params: [
			{ code: 'condition', name: 'Condition', type: 'SBrick<condition>' }, //TODO
		],
		exec: (runtime, params, ctx) => {
			return !runtime.execBrick(params.condition, ctx);
		},
	},
	{
		type: 1,
		subtype: 2,
		lib: 'condition',
		func: 'eq',
		name: 'Equal',
		params: [
			{ code: 'value1', name: 'Value1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			return runtime.execBrick(params.value1, ctx) === runtime.execBrick(params.value2, ctx);
		},
	},
	{
		type: 1,
		subtype: 3,
		lib: 'condition',
		func: 'gt',
		name: 'Greater than',
		params: [
			{ code: 'value1', name: 'Value1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			return runtime.execBrick(params.value1, ctx) > runtime.execBrick(params.value2, ctx);
		},
	},
	{
		type: 1,
		subtype: 4,
		lib: 'condition',
		func: 'lt',
		name: 'Lesser than',
		params: [
			{ code: 'value1', name: 'Value1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			return runtime.execBrick(params.value1, ctx) < runtime.execBrick(params.value2, ctx);
		},
	},
	{
		type: 1,
		subtype: 5,
		lib: 'condition',
		func: 'arg',
		name: 'Argument',
		params: [{ code: 'name', name: 'Name', type: 'SString', readonly: true }],
		exec: generic.arg,
	},
	{
		type: 1,
		subtype: 6,
		lib: 'condition',
		func: 'or',
		name: 'Or',
		params: [
			{ code: 'cond1', name: 'Cond #1', type: 'SBrick<condition>' },
			{ code: 'cond2', name: 'Cond #2', type: 'SBrick<condition>' },
		],
		exec: (runtime, params, ctx) => {
			return runtime.execBrick(params.cond1, ctx) || runtime.execBrick(params.cond2, ctx);
		},
	},
	{
		type: 1,
		subtype: 7,
		lib: 'condition',
		func: 'and',
		name: 'And',
		params: [
			{ code: 'cond1', name: 'Cond #1', type: 'SBrick<condition>' },
			{ code: 'cond2', name: 'Cond #2', type: 'SBrick<condition>' },
		],
		exec: (runtime, params, ctx) => {
			return runtime.execBrick(params.cond1, ctx) && runtime.execBrick(params.cond2, ctx);
		},
	},
	{
		type: 1,
		subtype: 8,
		lib: 'condition',
		func: 'iter_or',
		name: 'OR Iterator',
		params: [
			{
				code: 'iter_condition',
				name: 'Iteration Condition',
				type: 'SBrick<condition>',
			},
			{ code: 'condition', name: 'Condition', type: 'SBrick<condition>' },
			{ code: 'limit', name: 'Limit', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let limit = runtime.execBrick(params.limit, ctx);
			let objs = [];
			let oldObj = ctx.object;
			let objects = [...ctx.game.objects.values()];
			runtime.shuffle(objects);
			while (limit > 0 && objects.length > 0) {
				ctx.object = objects.pop();
				if (runtime.execBrick(params.iter_condition, ctx)) {
					objs.push(ctx.object);
					limit--;
				}
			}
			let result = false;
			for (let obj of objs) {
				ctx.object = obj;
				result = result || runtime.execBrick(params.condition, ctx);
			}
			ctx.object = oldObj;
			return result;
		},
	},
	{
		type: 1,
		subtype: 9,
		lib: 'condition',
		func: 'iter_and',
		name: 'AND Iterator',
		params: [
			{
				code: 'iter_condition',
				name: 'Iteration Condition',
				type: 'SBrick<condition>',
			},
			{ code: 'condition', name: 'Condition', type: 'SBrick<condition>' },
			{ code: 'limit', name: 'Limit', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let limit = runtime.execBrick(params.limit, ctx);
			let objs = [];
			let oldObj = ctx.object;
			let objects = [...ctx.game.objects.values()];
			runtime.shuffle(objects);
			while (limit > 0 && objects.length > 0) {
				ctx.object = objects.pop();
				if (runtime.execBrick(params.iter_condition, ctx)) {
					objs.push(ctx.object);
					limit--;
				}
			}
			let result = true;
			for (let obj of objs) {
				ctx.object = obj;
				result = result && runtime.execBrick(params.condition, ctx);
			}
			ctx.object = oldObj;
			return result;
		},
	},
];

module.exports = { basicConditions };