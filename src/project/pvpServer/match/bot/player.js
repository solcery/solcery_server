const Master = {};

const randomInt = (max) => {
	return Math.floor(Math.random() * max)
}

Master.onCreate = function(data) {
	if (!data.bot) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.bot = data.bot;
}

Master.onJoinMatch = function(match, playerIndex) {
	this.playerIndex = playerIndex;
	assert(this.match);
	let botContent = objget(this.match, 'gameBuild', 'content', 'bot');
	if (!botContent) {
		this.disableMixinCallbacks(Master);
		return;
	}
	assert(botContent)
	let playerSettings = Object.values(botContent.players).find(player => player.index === this.playerIndex);
	assert(playerSettings);
	let bots = playerSettings.bots;
	let botId = bots[randomInt(bots.length)];
	let strategy = botContent.bots[botId];
	assert(strategy);
	this.strategy = strategy;
	this.rules = strategy.rules.map(ruleId => botContent.botRules[ruleId]);
	this.runtime = this.match.gameState.runtime;
	// TODO: own brick runtime?
	assert(this.rules);
}

Master.botContext = function() {
	let ctx = this.match.gameState.createContext();
	ctx.sendCommand = (commandId, objectId) => {
		let action = {
			type: 'gameCommand',
			commandId,
			ctx: {
				object_id: objectId,
			}
		}
		this.match.execAllMixins('onPlayerAction', this, action);
	}
	ctx.scopes[0].vars = {
		...this.strategy.scopeVars,
	}
	return ctx;
}

Master.onMatchStart = function(data) {
	this.think();
}

Master.onMatchAction = function(data) {
	this.think();
}

Master.execBrick = function(brick) {
	let ctx = this.botContext();
	return this.runtime.execBrick(brick, ctx);
}

Master.think = function() {
	let active = this.execBrick(this.strategy.activationCondition);
	if (!active) return;
	let actions = [];
	for (let rule of this.rules) {
		let condition = this.execBrick(rule.condition);
		if (!condition) continue;
		let weight = this.execBrick(rule.weight);
		if (weight > 0) {
			actions.push({
				name: rule.name,
				weight,
				action: rule.action,
			})
		}
	}
	if (actions.length === 0) return;
	let sumWeight = 0;
	for (let action of actions) {
		sumWeight += action.weight;
	}
	if (sumWeight === 0) return;
	let currentWeigth = randomInt(sumWeight);
	let chosenAction;
	while (currentWeigth >= 0) {
		let current = actions.shift();
		chosenAction = current.action;
		currentWeigth -= current.weight;
	}
	this.execBrick(chosenAction);
}

module.exports = Master;
