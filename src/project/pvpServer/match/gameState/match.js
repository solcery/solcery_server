const GameState = require('./gameState');
const Master = {};

Master.onCreate = function(data) {
	let content = objget(this, 'gameBuild', 'content', 'web');
	if (!content) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.gameState = new GameState({
		seed: this.seed,
		players: this.players,
		content,
	})
}

Master.onAction = function(action) {
	let { type, commandId, ctx, playerIndex } = action;
	switch (type) {
		case 'init':
			this.gameState.start(this.players);
			break;
		case 'gameCommand':
			this.gameState.applyCommand(commandId, ctx)
			break;
		default: 
			break;
	}
}

module.exports = Master;
