const Master = {};

Master.onCreate = function(data) {
	let content = objget(this, 'gameBuild', 'content', 'web');
	if (!content) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.createGameState(content, this.players, this.seed)
}

Master.onAction = function(action) {
	this.gameStateAction(action);
}

module.exports = Master;
