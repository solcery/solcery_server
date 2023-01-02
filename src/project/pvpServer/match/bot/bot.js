const util = require('util');

const randomInt = (max) => {
	return Math.floor(Math.random() * max)
}

class Bot {
	constructor(data) {
		this.onCommand = data.onCommand;
		this.strategy = data.strategy;
		this.rules = data.rules;
		this.runtime = data.gameState.auxBrickRuntime();
		this.runtime.addBindings('client', this.getClientBindings());
	}

	getClientBindings () {
		let client = {}
		client.startTimer = () => {};
		client.pause = (duration) => this.onPause && this.onPause(duration);
		client.stopTimer = () => {};
		client.pushAction = () => {};
		client.sendCommand = (...args) => this.onCommand && this.onCommand(...args);
		return client;
	}

	execBrick = function(brick) {
		let ctx = this.runtime.context();
		if (this.strategy.scopeVars) {
			for (let { varName, value } of this.strategy.scopeVars) {
				ctx.scopes[0].vars[varName] = value;
			}
		}
		return this.runtime.execBrick(brick, ctx);
	}

	think() {
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
