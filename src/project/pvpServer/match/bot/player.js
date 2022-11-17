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
	let gameState = this.match.gameState;
	this.bot = new Bot({
		gameBuild,
		gameState,
		playerIndex, 
		onCommand: action => this.match.execAllMixins('onPlayerAction', this, action),
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
