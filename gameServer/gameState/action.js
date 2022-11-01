// import { generic } from './runtime';

const generic = {
	arg: (runtime, params, ctx) => {
		var scope = ctx.scopes.pop();
		var result = runtime.execBrick(scope.args[params.name], ctx);
		ctx.scopes.push(scope);
		return result;
	}
};

const basicActions = [
	{
		type: 0,
		subtype: 0,
		lib: 'action',
		func: 'void',
		name: 'Void',
		params: [],
		exec: () => {},
	},
	{
		lib: 'action',
		func: 'error',
		name: 'ERROR',
		hidden: true,
		params: [{ code: 'data', name: 'Data', type: 'SString', readonly: true }],
		exec: () => {},
	},
	{
		type: 0,
		subtype: 1,
		lib: 'action',
		func: 'two',
		name: 'Two actions',
		params: [
			{ code: 'action1', name: 'Action #1', type: 'SBrick<action>' },
			{ code: 'action2', name: 'Action #2', type: 'SBrick<action>' },
		],
		exec: (runtime, params, ctx) => {
			runtime.execBrick(params.action1, ctx);
			runtime.execBrick(params.action2, ctx);
		},
	},
	{
		type: 0,
		subtype: 2,
		lib: 'action',
		func: 'if_then',
		name: 'If-Then-Else',
		params: [
			{ code: 'if', name: 'If', type: 'SBrick<condition>' },
			{ code: 'then', name: 'Then', type: 'SBrick<action>' },
			{ code: 'else', name: 'Else', type: 'SBrick<action>' },
		],
		exec: (runtime, params, ctx) => {
			if (runtime.execBrick(params.if, ctx)) {
				runtime.execBrick(params.then, ctx);
			} else {
				runtime.execBrick(params.else, ctx);
			}
		},
	},
	{
		type: 0,
		subtype: 3,
		lib: 'action',
		func: 'loop',
		name: 'Loop',
		params: [
			{ code: 'counter_var', name: 'Counter var', type: 'SString', value: 'i' },
			{ code: 'iterations', name: 'Iterations', type: 'SBrick<value>' },
			{ code: 'action', name: 'Action', type: 'SBrick<action>' },
		],
		exec: (runtime, params, ctx) => {
			let iter = runtime.execBrick(params.iterations, ctx);
			for (let i = 0; i < iter; i++) {
				ctx.vars[params.counter_var] = i; //TODO: cleanup
				runtime.execBrick(params.action, ctx);
			}
		},
	},
	{
		type: 0,
		subtype: 4,
		lib: 'action',
		func: 'arg',
		name: 'Argument',
		params: [{ code: 'name', name: 'Name', type: 'SString', readonly: true }],
		exec: generic.arg,
	},
	{
		type: 0,
		subtype: 5,
		lib: 'action',
		func: 'iter',
		name: 'Iterator',
		params: [
			{ code: 'condition', name: 'Condition', type: 'SBrick<condition>' },
			{ code: 'action', name: 'Action', type: 'SBrick<action>' },
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
				if (runtime.execBrick(params.condition, ctx)) {
					objs.push(ctx.object);
					limit--;
				}
			}
			for (let obj of objs) {
				ctx.object = obj;
				runtime.execBrick(params.action, ctx);
			}
			ctx.object = oldObj;
		},
	},
	{
		type: 0,
		subtype: 6,
		lib: 'action',
		func: 'set_var',
		name: 'Set variable',
		params: [
			{ code: 'var_name', name: 'Var', type: 'SString' },
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let varName = params.var_name;
			let value = params.value;
			ctx.vars[varName] = runtime.execBrick(value, ctx);
		},
	},
	{
		type: 0,
		subtype: 7,
		lib: 'action',
		func: 'set_attr',
		name: 'Set attribute',
		params: [
			{ code: 'attr_name', name: 'Attr', type: 'SLink<attributes|code>' },
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let attrName = params.attr_name;
			let value = runtime.execBrick(params.value, ctx);
			ctx.object.setAttr(attrName, value);
		},
	},
	{
		type: 0,
		subtype: 8,
		lib: 'action',
		func: 'use_card',
		name: 'Use card',
		params: [],
		exec: (runtime, params, ctx) => {
			let tplId = ctx.object.tplId;
			let cardType = ctx.game.content.get('cardTypes', tplId);
			if (cardType.action) {
				runtime.execBrick(cardType.action, ctx);
			}
		},
	},
	{
		type: 0,
		subtype: 9,
		lib: 'action',
		func: 'set_game_attr',
		name: 'Set game attribute',
		params: [
			{ code: 'attr_name', name: 'Attr', type: 'SLink<gameAttributes|code>' },
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let attrName = params.attr_name;
			let value = runtime.execBrick(params.value, ctx);
			if (ctx.game.attrs[attrName] === undefined) throw new Error('Trying to set unknown game attr ' + attrName);
			ctx.game.setAttr(attrName, value);
		},
	},
	{
		type: 0,
		subtype: 10,
		lib: 'action',
		func: 'pause',
		name: 'Pause',
		params: [{ code: 'duration', name: 'Duration', type: 'SBrick<value>' }],
		exec: (runtime, params, ctx) => {
			let duration = runtime.execBrick(params.duration, ctx);
			ctx.game.pause(duration);
		},
	},
	{
		type: 0,
		subtype: 11,
		lib: 'action',
		func: 'event',
		name: 'Event',
		params: [{ code: 'event_name', name: 'Event name', type: 'SString' }],
		exec: (runtime, params, ctx) => {
			let tplId = ctx.object.tplId;
			let cardType = ctx.game.content.cardTypes[tplId];
			let fieldName = `action_on_${params.event_name}`;
			if (cardType[fieldName]) {
				ctx.scopes.push(runtime.newScope());
				runtime.execBrick(cardType[fieldName], ctx);
				ctx.scopes.pop();
			}
		},
	},
	{
		type: 0,
		subtype: 12,
		lib: 'action',
		func: 'create_entity',
		name: 'CreateEntity',
		params: [
			{ code: 'card_type', name: 'Card type', type: 'SBrick<value>' },
			{ code: 'place', name: 'Place', type: 'SBrick<value>' },
			{ code: 'action', name: 'Action', type: 'SBrick<action>' },
		],
		exec: (runtime, params, ctx) => {
			let card_type = runtime.execBrick(params.card_type, ctx);
			let place = runtime.execBrick(params.place, ctx);
			ctx.game.createEntity(card_type, place, params.action, ctx);
		},
	},
	{
		type: 0,
		subtype: 13,
		lib: 'action',
		func: 'delete_entity',
		name: 'Delete entity',
		params: [],
		exec: (runtime, params, ctx) => {
			ctx.obj.deleted = true;
		},
	},
	{
		type: 0,
		subtype: 14,
		lib: 'action',
		func: 'clear_attrs',
		name: 'Clear attrs',
		params: [],
		exec: (runtime, params, ctx) => {
			for (let attrName of Object.keys(ctx.object.attrs)) {
				ctx.object.setAttr(attrName, 0);
			}
		},
	},
	{
		type: 0,
		subtype: 15,
		lib: 'action',
		func: 'start_timer',
		name: 'Start Timer',
		params: [{ code: 'duration', name: 'Duration', type: 'SBrick<value>' }],
		exec: (runtime, params, ctx) => {
			let duration = runtime.execBrick(params.duration, ctx);
			ctx.game.startTimer(ctx.object, duration);
		},
	},
	{
		type: 0,
		subtype: 16,
		lib: 'action',
		func: 'stop_timer',
		name: 'Stop Timer',
		params: [],
		exec: (runtime, params, ctx) => {
			ctx.game.stopTimer(ctx.object);
		},
	},
	{
		type: 0,
		subtype: 17,
		lib: 'action',
		func: 'transform',
		name: 'Transform',
		params: [{ code: 'tpl_id', name: 'Tpl Id', type: 'SBrick<value>' }],
		exec: (runtime, params, ctx) => {
			let tplId = runtime.execBrick(params.tpl_id, ctx);
			ctx.object.transform(tplId);
		},
	},
	{
		type: 0,
		subtype: 18,
		lib: 'action',
		func: 'play_sound',
		name: 'Play sound',
		params: [{ code: 'sound_id', name: 'Sound', type: 'SLink<sounds>' }],
		exec: (runtime, params, ctx) => {
			ctx.game.playSound(params.sound_id);
		},
	},
	{
		type: 0,
		subtype: 19,
		lib: 'action',
		func: 'set_scope_var',
		name: 'Set scope variable',
		params: [
			{ code: 'var_name', name: 'Var', type: 'SString' },
			{ code: 'value', name: 'Value', type: 'SBrick<value>' },
		],
		exec: (runtime, params, ctx) => {
			let varName = params.var_name;
			let value = params.value;
			let scope = ctx.scopes[ctx.scopes.length - 1]
			scope.vars[varName] = runtime.execBrick(params.value, ctx);
		},
	},
	{
		type: 0,
		subtype: 0,
		lib: 'action',
		func: 'console_log',
		name: 'Console log',
		width: 20,
		params: [
			{
				code: 'message',
				name: 'Message',
				type: {
					name: 'SString',
					data: {
						textArea: {
							rows: 4,
						},
						width: 800,
					},
				},
			},
			{
				code: 'level',
				name: 'Level',
				type: {
					name: 'SEnum',
					data: {
						values: ['log', 'warn'],
						titles: ['Log', 'Warn'],
					},
				},
			},
		],
		exec: (runtime, params, ctx) => {
			function applyMacro(match, obj, param) {
				var src = undefined;
				if (obj === 'obj') {
					src = ctx.object.attrs;
				}
				if (obj === 'game') {
					src = ctx.game.attrs;
				}
				if (obj === 'scope') {
					src = ctx.scopes[ctx.scopes.length - 1].vars;
				}
				if (obj === 'vars') {
					src = ctx.vars;
				}
				if (src) {
					if (!param) return JSON.stringify(src);
					if (src[param] !== undefined) return src[param];
				}
				return match;
			}
			let res = params.message.replace(/\{([a-zA-Z]+).?([_a-zA-Z0-9]+)?\}/g, applyMacro);
			console[params.level](res);
		},
	},
];

module.exports = { basicActions };