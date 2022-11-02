const { BrickRuntime } = require("./runtime");
const { getTable } = require("./utils/index")

class Entity {
	id = undefined;
	tplId = undefined;

	constructor(id, tplId, gameState) {
		this.id = id;
		this.tplId = tplId;
		this.attrs = {};
		this.gameState = gameState;
		for (let attr of Object.values(gameState.content.attributes)) {
			this.attrs[attr.code] = 0;
		}
	}

	setAttr(attr, value) {
		if (this.attrs[attr] === undefined) throw new Error(`trying to set unknown entity attr [${attr}]`);
		this.attrs[attr] = value;
		// this.gameState.pushPackageEvent('onEntityAttrChanged', this, attr, value);
	}

	transform(tplId) {
		this.tplId = tplId;
		// this.gameState.pushPackageEvent('onEntityTransform', this, tplId);
	}
}

class GameState {
	objects = {};
	attrs = {};
	diff = undefined;
	diffLog = undefined;

	constructor(data) {
		this.seed = data.seed ?? 0;
		this.content = data.content;
		this.players = data.players;
		this.runtime = new BrickRuntime(this.content, data.seed);
		for (let attr of Object.values(this.content.gameAttributes)) {
			this.attrs[attr.code] = 0;
		}
	}

	checkOutcome() {
		let outcomeValue = getTable(this.content, 'gameSettings', 'outcome');
		if (!outcomeValue) return;
		let ctx = this.createContext();
		let outcome = this.runtime.execBrick(outcomeValue, ctx);
		if (outcome === 0) return;
		return outcome;
	}

	// newPackage() {
	// 	this.unityPackage = new UnityPackage(this);
	// }

	// exportPackage() {
	// 	if (!this.unityPackage) this.newPackage(this);
	// 	return this.unityPackage.export();
	// }

	// pushPackageEvent(event, ...args) {
	// 	if (!this.unityPackage) return;
	// 	this.unityPackage[event](...args);
	// }

	start = (players, layoutOverride) => {
		let layout = layoutOverride ?? this.content.gameSettings.layout;
		if (!layout) throw new Error('Error: Trying to initLayout without preset scheme');

		for (let cardPack of Object.values(this.content.cards)) {
			if (!layout.includes(cardPack.preset)) continue;
			for (let i = 0; i < cardPack.amount; i++) {
				this.createEntity(cardPack.cardType, cardPack.place, cardPack.initializer);
			}
			if (cardPack.cards) {
				for (let { cardType, amount } of cardPack.cards) {
					for (let j = 0; j < amount; j++) {
						this.createEntity(cardType, cardPack.place, cardPack.initializer);
					}
				}
			}
		}
		if (this.content.collections) {
			for (let player of players) {
				if (!player.nfts) continue;
				for (let nft of player.nfts) {
					let collection = Object.values(this.content.collections)
						.find(obj => obj.collection === nft.collection);
					if (!collection) continue;
					let playerInfo = Object.values(this.content.players).find(p => p.index === player.index);
					let entity = this.createEntity(collection.cardType, playerInfo.nftPlace, collection.initAction);
					nft.entityId = entity.id;
				}
			}
		}
		if (this.content.gameSettings.initAction) {
			let ctx = this.createContext();
			this.runtime.execBrick(this.content.gameSettings.initAction, ctx)
		}
	};

	objectEvent = (objectId, event, vars) => {
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to call event unkown object!');
		let ctx = this.createContext(object, { vars });
		let cardType = this.content.cardTypes[object.tplId];
		if (cardType[event]) {
			this.runtime.execBrick(cardType[event], ctx);
		}
	};

	applyCommand = (commandId, scopeVars) => {
		let command = this.content.commands[commandId];
		if (!command) throw 'No such game command';
		let ctx = this.createContext(undefined);
		if (scopeVars) Object.assign(ctx.scopes[0].vars, scopeVars);
		if (command.action) {
			this.runtime.execBrick(command.action, ctx);
		}
	};

	// dragndrop = (objectId, dragAndDropId, targetPlace) => {
	// 	let object = this.objects[objectId];
	// 	if (!object) throw new Error('Attempt to call drop for unkown object!');
	// 	let ctx = this.createContext(object, {
	// 		vars: { target_place: targetPlace },
	// 	});
	// 	let dragndrop = this.content.dragNDrops[dragAndDropId];
	// 	if (dragndrop.actionOnDrop) {
	// 		this.runtime.execBrick(dragndrop.actionOnDrop, ctx);
	// 	}
	// };

	setAttr(attr, value) {
		if (this.attrs[attr] === undefined) throw new Error('Error trying to set unknown game attr ' + attr);
		this.attrs[attr] = value;
		// this.pushPackageEvent('onGameAttrChanged', attr, value);
	}

	createEntity(cardTypeId, place, initAction, ctx) {
		let id = Object.values(this.objects).length + 1;
		let entity = new Entity(id, cardTypeId, this);
		this.objects[id] = entity;
		if (!place) throw new Error('Game.createEntity error: No place given for created entity!');
		entity.attrs.place = place;
		let cardType = this.content.cardTypes[cardTypeId];
		if (!cardType) throw new Error('Game.createEntity error: Unknown cardType!');

		// this.pushPackageEvent('onEntityCreated', entity);

		if (cardType.action_on_create) {
			this.runtime.execBrick(cardType.action_on_create, this.createContext(entity, ctx));
		}
		if (initAction) {
			this.runtime.execBrick(initAction, this.createContext(entity, ctx));
		}
		return entity;
	}

	createContext(object, extra = {}) {
		extra.game = this;
		return this.runtime.context(object, extra);
	}

	// pause(duration) {
	// 	this.pushPackageEvent('onPause', duration);
	// }

	// startTimer(object, duration) {
	// 	this.pushPackageEvent('onStartTimer', object, duration);
	// }

	// stopTimer(object) {
	// 	this.pushPackageEvent('onStopTimer', object);
	// }
	
	// playSound(soundId, volume) {
	// 	this.pushPackageEvent('onPlaySound', soundId);
	// }
}


const Master = {};

/* Simple Dweller-Wrapper around GameState class */
Master.onCreate = function(data) {
	this.inner = new GameState(data); 
}

Master.start = function(players) {
	this.inner.start(players, undefined);
}

Master.applyCommand = function(data) {
	let commandId = data.commandId;
	assert(commandId);
	let scopeVars = data.scopeVars;
	assert(scopeVars);
	this.inner.applyCommand(commandId, scopeVars);
}

Master.checkOutcome = function() {
	return this.inner.checkOutcome();
}

Master.onGameStart = function(data) {
	this.start(data.players);
}

Master.onGameAction = function(data) {
	let lastAction = data.actionLog.slice(-1).pop();
	let command = lastAction.action;
	let scopeVars = command.scopeVars;
	let context = lastAction.ctx;
	command.scopeVars = { ...scopeVars, ...context };
	this.applyCommand(command);
}

module.exports = Master