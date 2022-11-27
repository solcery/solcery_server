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
	let { type, commandId, ctx, playerIndex, time } = action;
	this.gameState.time = time;
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
	this.execAllMixins('onGameStateAction', action)
}

module.exports = Master;
