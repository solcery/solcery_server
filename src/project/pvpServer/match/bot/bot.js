const randomInt = (max) => {
	return Math.floor(Math.random() * max)
}

class Bot {
	constructor(data) {
		this.gameBuild = data.gameBuild;
		this.gameState = data.gameState;
		this.playerIndex = data.playerIndex;
		this.onCommand = data.onCommand;
		let botContent = this.gameBuild.content.bot;
		let playerSettings = Object.values(botContent.players).find(player => player.index === this.playerIndex);
		assert(playerSettings);
		let bots = playerSettings.bots;
		let botId = bots[randomInt(bots.length)];
		let strategy = botContent.bots[botId];
		assert(strategy);
		this.strategy = strategy;
		this.rules = strategy.rules.map(ruleId => botContent.botRules[ruleId]);
		this.actionLog = data.actionLog ?? [];
	}

	sendCommand = function (commandId, objectId) {
		let action = {
			type: 'gameCommand',
			commandId,
			ctx: {
				object_id: objectId,
			}
		}
		this.onCommand(action);
	}

	createContext = function() {
		let ctx = this.gameState.createContext({
			sendCommand: (commandId, objectId) => this.sendCommand(commandId, objectId),
		})
		if (this.strategy.scopeVars) {
			for (let { varName, value } of this.strategy.scopeVars) {
				ctx.scopes[0].vars[varName] = value;
			}
		}
		return ctx;
	}

	execBrick = function(brick) {
		let ctx = this.createContext();
		return this.gameState.getRuntime().execBrick(brick, ctx);
	}

	think() {
		if (this.gameState.getResult()) return true;
		let active = this.execBrick(this.strategy.activationCondition);
		if (!active) return true;
		let possibleActions = [];
		for (let rule of this.rules) {
			let condition = this.execBrick(rule.condition);
			if (!condition) continue;
			let weight = this.execBrick(rule.weight);
			if (weight <= 0) continue;
			possibleActions.push({
				name: rule.name,
				weight,
				action: rule.action,
			})	
		}
		if (possibleActions.length === 0) return false;
		let sumWeight = 0;
		for (let action of possibleActions) {
			sumWeight += action.weight;
		}
		if (sumWeight === 0) return false;
		let currentWeigth = randomInt(sumWeight);
		let chosenRule;
		while (currentWeigth >= 0) {
			let current = possibleActions.shift();
			chosenRule = current;
			currentWeigth -= current.weight;
		}
		this.execBrick(chosenRule.action);
		return true;
	}
}

module.exports = Bot;
