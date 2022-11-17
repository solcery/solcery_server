class GameState {
	objects = {};
	attrs = {};
	maxEntityId = 0;

	constructor(data) {
		assert(data.seed !== undefined)
		this.seed = data.seed;
		this.content = data.content;
		this.players = data.players;
		this.runtime = new BrickRuntime(this.content, data.seed);
		this.miscRuntime = new BrickRuntime(this.content, data.seed); //TODO: proper name
		if (this.content.gameAttributes) {
			for (let attr of Object.values(this.content.gameAttributes)) {
				this.attrs[attr.code] = 0;
			}
		}
	}

	getRuntime(type = 'misc') {
		if (type === 'misc') {
			return this.miscRuntime;
		}
		if (type === 'main') {
			return this.runtime;
		}
	}

	getResult() {
		let gameOverCondition = this.content.gameSettings.gameOverCondition;
		if (!gameOverCondition) return;
		let ctx = this.createContext();
		let finished = this.getRuntime().execBrick(gameOverCondition, ctx);
		if (!finished) return;
		if (!this.content.players) return {};
		let playerScore = {};
		for (let player of this.players) {
			let playerInfo = Object.values(this.content.players).find(p => p.index === player.index);
			let scoreValue = playerInfo.score;
			if (!scoreValue) {
				playerScore[playerInfo.index] = 0;
				continue;
			}
			let ctx = this.createContext();
			let score = this.getRuntime().execBrick(scoreValue, ctx);
			playerScore[playerInfo.index] = score;
		}
		return {
			playerScore,
		};
	}

	start = () => {
		let layout = this.content.gameSettings.layout;
		if (layout) {
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
		}
		if (this.content.collections) {
			for (let player of this.players) {
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
		let ctx = this.createContext({ object, vars });
		let cardType = this.content.cardTypes[object.tplId];
		if (cardType[event]) {
			this.runtime.execBrick(cardType[event], ctx);
		}
	};

	applyCommand = (commandId, scopeVars) => {
		let command = this.content.commands[commandId];
		if (!command) throw 'No such game command';
		let ctx = this.createContext();
		if (scopeVars) Object.assign(ctx.scopes[0].vars, scopeVars);
		if (command.action) {
			this.runtime.execBrick(command.action, ctx);
		}
		for (let objectId of Object.keys(this.objects)) {
			if (this.objects[objectId].deleted) {
				delete this.objects[objectId];
			}
		}
	};

	setAttr(attr, value) {
		if (this.attrs[attr] === undefined) throw new Error('Error trying to set unknown game attr ' + attr);
		this.attrs[attr] = value;
	}

	createEntity(cardTypeId, place, initAction, ctx) {
		let id = this.maxEntityId + 1;
		assert(!this.objects[id], `Game.createEntity error: Object Id '${id}' is already taken!`);
		let entity = new Entity(id, cardTypeId, this);
		this.maxEntityId = id;
		this.objects[id] = entity;
		if (!place) throw new Error('Game.createEntity error: No place given for created entity!');
		entity.attrs.place = place;
		let cardType = this.content.cardTypes[cardTypeId];
		if (!cardType) throw new Error('Game.createEntity error: Unknown cardType!');
		ctx = ctx ?? this.createContext();
		let oldCtxObject = ctx.object;
		ctx.object = entity;
		if (cardType.action_on_create) {
			this.runtime.execBrick(cardType.action_on_create, ctx);
		}
		if (initAction) {
			this.runtime.execBrick(initAction, ctx);
		}
		ctx.object = oldCtxObject;
		return entity;
	}

	createContext(extra = {}) { // TODO: scope support
		extra.game = this;
		return this.runtime.context(extra);
	}

}

class Entity {
	id = undefined;
	tplId = undefined;

	constructor(id, tplId, gameState) {
		this.id = id;
		this.tplId = tplId;
		this.attrs = {};
		this.gameState = gameState;
		if (gameState.content.attributes) {
			for (let attr of Object.values(gameState.content.attributes)) {
				this.attrs[attr.code] = 0;
			}
		}
	}

	setAttr(attr, value) {
		if (this.attrs[attr] === undefined) throw new Error(`trying to set unknown entity attr [${attr}]`);
		this.attrs[attr] = value;
	}

	transform(tplId) {
		this.tplId = tplId;
	}
}

module.exports = GameState;
