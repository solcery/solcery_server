const basicValues = [
	{
		type: 2,
		subtype: 0,
		lib: 'value',
		func: 'const',
		name: 'Constant',
		params: [{ code: 'value', name: 'Value', type: 'SInt', value: 0 }],
		exec: (runtime, params, ctx) => {
			return params.value;
		},
	},
	{
		lib: 'value',
		func: 'error',
		name: 'ERROR',
		hidden: true,
		params: [{ code: 'data', name: 'Data', type: 'SString', readonly: true }],
		exec: () => {
			return 0;
		},
	},
	{
		type: 2,
		subtype: 0,
		lib: 'value',
		func: 'place',
		name: 'Place',
		params: [
			{
				code: 'value',
				name: 'Value',
				type: {
					name: 'SLink',
					data: {
						templateCode: 'places',
						field: 'placeId',
					},
				},
			},
		],
		exec: (runtime, params, ctx) => {
			return params.value;
		},
	},
	{
		type: 2,
		subtype: 0,
		lib: 'value',
		func: 'cardType',
		name: 'Card type',
		params: [{ code: 'value', name: 'Value', type: 'SLink<cardTypes>' }],
		exec: (runtime, params, ctx) => {
			return params.value;
		},
	},
	{
		type: 2,
		subtype: 1,
		lib: 'value',
		func: 'var',
		name: 'Variable',
		params: [{ code: 'var_name', name: 'Variable name', type: 'SString' }],
		exec: (runtime, params, ctx) => {
			let res = ctx.vars[params.var_name];
			return res ?? 0;
		},
	},
	{
		type: 2,
		subtype: 2,
		lib: 'value',
		func: 'attr',
		name: 'Attribute',
		params: [{ code: 'attr_name', name: 'Attribute name', type: 'SLink<attributes|code>' }],
		exec: (runtime, params, ctx) => {
			return ctx.object.attrs[params.attr_name];
		},
	},
	{
		type: 2,
		subtype: 3,
		lib: 'value',
		func: 'arg',
		name: 'Argument',
		params: [{ code: 'name', name: 'Name', type: 'SString', readonly: true }],
		exec: (runtime, params, ctx) => {
			var scope = ctx.scopes.pop();
			var result = runtime.execBrick(scope.args[params.name], ctx);
			ctx.scopes.push(scope);
			return result;
		},
	},
	{
		type: 2,
		subtype: 4,
		lib: 'value',
		func: 'if_then',
		name: 'If-Then-Else',
		params: [
			{ code: 'if', name: 'If', type: 'SBrick<condition>' },
			{ code: 'then', name: 'Then', type: 'SBrick<value>' },
			{ code: 'else', name: 'Else', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			if (runtime.execBrick(params.if, ctx)) return runtime.execBrick(params.then, ctx);
			else return runtime.execBrick(params.else, ctx);
		},
	},
	{
		type: 2,
		subtype: 5,
		lib: 'value',
		func: 'add',
		name: 'Addition',
		params: [
			{ code: 'value1', name: 'Value #1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value #2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let v1 = runtime.execBrick(params.value1, ctx);
			let v2 = runtime.execBrick(params.value2, ctx);
			return v1 + v2;
		},
	},
	{
		type: 2,
		subtype: 6,
		lib: 'value',
		func: 'sub',
		name: 'Subtraction',
		params: [
			{ code: 'value1', name: 'Value #1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value #2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let v1 = runtime.execBrick(params.value1, ctx);
			let v2 = runtime.execBrick(params.value2, ctx);
			return v1 - v2;
		},
	},
	{
		type: 2,
		subtype: 7,
		lib: 'value',
		func: 'mul',
		name: 'Multiplication',
		params: [
			{ code: 'value1', name: 'Value #1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value #2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let v1 = runtime.execBrick(params.value1, ctx);
			let v2 = runtime.execBrick(params.value2, ctx);
			return v1 * v2;
		},
	},
	{
		type: 2,
		subtype: 8,
		lib: 'value',
		func: 'div',
		name: 'Division',
		params: [
			{ code: 'value1', name: 'Value #1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value #2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let v1 = runtime.execBrick(params.value1, ctx);
			let v2 = runtime.execBrick(params.value2, ctx);
			return Math.floor(v1 / v2);
		},
	},
	{
		type: 2,
		subtype: 9,
		lib: 'value',
		func: 'mod',
		name: 'Modulo',
		params: [
			{ code: 'value1', name: 'Value #1', type: 'SBrick<value>' },
			{ code: 'value2', name: 'Value #2', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let v1 = runtime.execBrick(params.value1, ctx);
			let v2 = runtime.execBrick(params.value2, ctx);
			return v1 - Math.floor(v1 / v2) * v2;
		},
	},
	{
		type: 2,
		subtype: 10,
		lib: 'value',
		func: 'random',
		name: 'Random',
		params: [
			{ code: 'from', name: 'From', type: 'SBrick<value>' },
			{ code: 'to', name: 'To', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let min = runtime.execBrick(params.from, ctx);
			let max = runtime.execBrick(params.to, ctx);
			return runtime.random.range(min, max);
		},
	},
	{
		type: 2,
		subtype: 11,
		lib: 'value',
		func: 'entity_id',
		name: 'Card Id',
		params: [],
		exec: (runtime, params, ctx) => {
			return ctx.object.id;
		},
	},
	{
		type: 2,
		subtype: 12,
		lib: 'value',
		func: 'tpl_id',
		name: 'Card type Id',
		params: [],
		exec: (runtime, params, ctx) => {
			return ctx.object.tplId;
		},
	},
	{
		type: 2,
		subtype: 13,
		lib: 'value',
		func: 'game_attr',
		name: 'Game Attribute',
		params: [{ code: 'attr_name', name: 'Attribute name', type: 'SLink<gameAttributes|code>' }],
		exec: (runtime, params, ctx) => {
			return ctx.game.attrs[params.attr_name];
		},
	},
	{
		type: 2,
		subtype: 14,
		lib: 'value',
		func: 'iter_sum',
		name: 'Sum Iterator',
		params: [
			{
				code: 'iter_condition',
				name: 'Iteration Condition',
				type: 'SBrick<condition>',
			},
			{ code: 'target_value', name: 'Target Value', type: 'SBrick<value>' },
			{ code: 'limit', name: 'Limit', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let limit = runtime.execBrick(params.limit, ctx);
			let objs = [];
			let oldObj = ctx.object;
			let objects = [...Object.values(ctx.game.objects)];
			runtime.shuffle(objects);
			while (limit > 0 && objects.length > 0) {
				ctx.object = objects.pop();
				if (runtime.execBrick(params.iter_condition, ctx)) {
					objs.push(ctx.object);
					limit--;
				}
			}
			let result = 0;
			for (let obj of objs) {
				ctx.object = obj;
				result = result + runtime.execBrick(params.target_value, ctx);
			}
			ctx.object = oldObj;
			return result;
		},
	},
	{
		type: 2,
		subtype: 15,
		lib: 'value',
		func: 'set_var',
		name: 'Set variable',
		params: [
			{ code: 'var_name', name: 'Var name', type: 'SString' },
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let varName = params.var_name;
			let value = params.value;
			ctx.vars[varName] = runtime.execBrick(value, ctx);
			return ctx.vars[varName];
		},
	},
	{
		type: 2,
		subtype: 16,
		lib: 'value',
		func: 'iter_max',
		name: 'Max Iterator',
		params: [
			{
				code: 'iter_condition',
				name: 'Iteration Condition',
				type: 'SBrick<condition>',
			},
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
			{ code: 'fallback', name: 'Fallback', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let old_object = ctx.object;
			let objects = [...Object.values(ctx.game.objects)];
			runtime.shuffle(objects);
			let result = Number.NEGATIVE_INFINITY;
			for (let obj of objects) {
				ctx.object = obj;
				if (runtime.execBrick(params.iter_condition, ctx)) {
					result = Math.max(runtime.execBrick(params.value, ctx), result);
				}
			}
			ctx.object = old_object;
			if (result === Number.NEGATIVE_INFINITY) {
				result = runtime.execBrick(params.fallback, ctx);
			}
			return result;
		},
	},
	{
		type: 2,
		subtype: 17,
		lib: 'value',
		func: 'iter_min',
		name: 'Min Iterator',
		params: [
			{
				code: 'iter_condition',
				name: 'Iteration Condition',
				type: 'SBrick<condition>',
			},
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
			{ code: 'fallback', name: 'Fallback', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let old_object = ctx.object;
			let objects = [...Object.values(ctx.game.objects)];
			runtime.shuffle(objects);
			let result = Number.POSITIVE_INFINITY;
			for (let obj of objects) {
				ctx.object = obj;
				if (runtime.execBrick(params.iter_condition, ctx)) {
					result = Math.min(runtime.execBrick(params.value, ctx), result);
				}
			}
			ctx.object = old_object;
			if (result === Number.POSITIVE_INFINITY) {
				result = runtime.execBrick(params.fallback, ctx);
			}
			return result;
		},
	},
	{
		type: 2,
		subtype: 18,
		lib: 'value',
		func: 'scope_var',
		name: 'Scope variable',
		params: [{ code: 'var_name', name: 'Variable name', type: 'SString' }],
		exec: (runtime, params, ctx) => {
			let scope = ctx.scopes[ctx.scopes.length - 1];
			return scope.vars[params.var_name] ?? 0;
		},
	},
	{
		type: 2,
		subtype: 19,
		lib: 'value',
		func: 'set_scope_var',
		name: 'Set scope variable',
		params: [
			{ code: 'var_name', name: 'Var name', type: 'SString' },
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let scope = ctx.scopes[ctx.scopes.length - 1];
			let varName = params.var_name;
			let value = runtime.execBrick(params.value, ctx);
			scope.vars[varName] = value
			return scope.vars[varName];
		},
	},
	{
		type: 2,
		subtype: 11, // TODO
		lib: 'value',
		func: 'time',
		name: 'Time',
		params: [],
		exec: (runtime, params, ctx) => {
			return objget(ctx, 'game', 'time') ?? 0;
		},
	}
];

module.exports = { basicValues };