const Master = {};

Master.onCreate = function(data) {
	let content = objget(this, 'gameBuild', 'content', 'web');
	if (!content) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.createGameState(content, this.players, this.seed)
	if (data.actionLog) {
		for (let action of data.actionLog) {
			this.gameStateAction(action);
		}
	}
}

Master.onGameStateAction = function(action) {
	this.result = this.gameState.getResult();
	if (this.result) {
		this.end();
	}
}

Master.onAction = function(action) {
	this.gameStateAction(action);
}

module.exports = Master;
