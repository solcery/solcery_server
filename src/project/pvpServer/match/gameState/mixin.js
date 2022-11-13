const GameState = require('./gameState');
const Master = {};

Master.createGameState = function(content, players, seed) {
	this.gameState = new GameState({
		content,
		players,
		seed,
	})
}

Master.gameStateAction = function(action) {
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
