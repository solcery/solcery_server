const Master = {};
const Bot = require('./bot');

Master.onCreate = function(data) {
	if (!data.bot) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.bot = data.bot;
}

Master.onJoinMatch = function(match) {
	for (let player of match.players) {
		if (player.id === this.id) {
			var playerIndex = player.index;
			break;
		}
	}
	assert(playerIndex);
	let gameBuild = this.match.gameBuild;
	let botContent = objget(gameBuild, 'content', 'bot');
	if (!botContent) {
		this.disableMixinCallbacks(Master);
		return;
	}
	let playerSettings = Object.values(botContent.players).find(player => player.index === playerIndex);
	if (!playerSettings) return;
	let gameState = this.match.gameState;
	let botIds = playerSettings.bots;
	let botId = botIds[Math.floor(Math.random() * botIds.length)]; // Choosing random bot
	let strategy = botContent.bots[botId];
	let rules = strategy.rules.map(ruleId => botContent.botRules[ruleId]);
	this.bot = new Bot({
		strategy,
		rules,
		gameState,
		onCommand: (commandId, ctx) => this.sendGameCommand(commandId, ctx),
	});
}

Master.onLeaveMatch = function(data) {
	this.delete();
}

Master.onMatchUpdate = function(data) {
	if (this.match.gameState.getResult()) {
		this.delete();
		return;
	}
	let panic = !this.bot.think();
	if (panic) {
		this.match.removePlayer(this)
	}
}

module.exports = Master;
