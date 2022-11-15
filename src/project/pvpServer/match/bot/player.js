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
	let botContent = objget(this.gameBuild, 'content', 'bot');
	if (!botContent) {
		this.disableMixinCallbacks(Master);
		return;
	}
}

Master.onLeaveMatch = function(data) {
	this.delete();
}

Master.onMatchUpdate = function(data) {
	if (data.started) { // Match start
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
	}
	if (!this.gameState) return;
	if (!data.actionLog) return; 
	this.updateActionLog(data.actionLog);
	if (this.gameState.getResult()) {
		this.delete();
	}
	let botAlive = this.bot.think();
	if (!botAlive) {
		this.match.removePlayer(this)
	}
}

Master.updateActionLog = function(actionLog) {
	if (this.actionLog.length >= actionLog.length) return;
	let toAdd = actionLog.slice(this.actionLog.length);
	for (let action of toAdd) {
		this.actionLog.push(action);
		this.gameStateAction(action);
	}
}

module.exports = Master;
