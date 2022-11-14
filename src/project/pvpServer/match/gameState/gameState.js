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

class GameState {
	objects = {};
	attrs = {};
	maxEntityId = 0;

	constructor(data) {
		assert(data.seed)
		this.seed = data.seed;
		this.content = data.content;
		this.players = data.players;
		this.runtime = new BrickRuntime(this.content, data.seed);
		if (this.content.gameAttributes) {
			for (let attr of Object.values(this.content.gameAttributes)) {
				this.attrs[attr.code] = 0;
			}
		}
	}

	checkOutcome() {
		let outcomeValue = objget(this.content, 'gameSettings', 'outcome');
		if (!outcomeValue) return;
		let ctx = this.createContext();
		let outcome = this.runtime.execBrick(outcomeValue, ctx);
		if (outcome === 0) return;
		return outcome;
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
		let id = ++this.maxEntityId;
		assert(!this.objects[id], `Game.createEntity error: Object Id '${id}' is already taken!`);
		this.objects[id] = entity;
		let entity = new Entity(id, cardTypeId, this);
		if (!place) throw new Error('Game.createEntity error: No place given for created entity!');
		entity.attrs.place = place;
		let cardType = this.content.cardTypes[cardTypeId];
		if (!cardType) throw new Error('Game.createEntity error: Unknown cardType!');
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

}

module.exports = GameState;
