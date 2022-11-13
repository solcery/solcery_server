const Master = {};
const Bot = require('./bot');

Master.onCreate = function(data) {
	if (!data.bot) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.bot = data.bot;
}

Master.onJoinMatch = function(match, playerIndex) {
	this.playerIndex = playerIndex; // find himself
	assert(this.match);
	this.gameBuild = this.match.gameBuild;
	this.actionLog = [];
}

Master.onLeaveMatch = function(data) {
	env.log('Bot left the match, deleting itself');
	this.delete();
}

Master.onMatchStart = function(data) {
	let botContent = objget(this.gameBuild, 'content', 'bot');
	if (!botContent) {
		this.disableMixinCallbacks(Master);
		return;
	}
	let gameContent = objget(this.gameBuild, 'content', 'web');
	let seed = data.seed;
	let players = data.players;
	this.createGameState(gameContent, players, seed);
	this.bot = new Bot({
		gameBuild: this.match.gameBuild,
		gameState: this.gameState,
		playerIndex: this.playerIndex, 
		onCommand: action => this.match.execAllMixins('onPlayerAction', this, action),
	});
	this.updateActionLog(data.actionLog);
	this.bot.think();
}

Master.updateActionLog = function(actionLog) {
	if (this.actionLog.length >= actionLog.length) return;
	let toAdd = actionLog.slice(this.actionLog.length);
	for (let action of toAdd) {
		this.actionLog.push(action);
		this.gameStateAction(action);
	}
}

Master.onMatchAction = function(data) {
	if (!this.gameState) return; // TODO: this is for tests. Player 2 gets it before match start
	this.updateActionLog(data.actionLog);
	this.bot.think();
}

module.exports = Master;
