const Master = {};

Master.onCreate = function(data) {
	if (!data.bot) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.bot = data.bot;
	this.algorithm = data.algorithm;
	this.possibleCommands = data.possibleCommands;
	// console.log('start a bot that', data.algorithm);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

Master.tryToAct = function(data) {
	let lastAction = data.actionLog.slice(-1).pop();
	let myPlayerData = this.game.players.find(p => p.id === this.id);
	assert(myPlayerData);
	let myIndex = myPlayerData.id;
	let myPlayerIndex = myPlayerData.index;

	if (this.algorithm === 'repeatLastAction') {
		if (!lastAction.player) { return; }
		if (lastAction.player === myIndex) { return; }
		this.execAllMixins('onWSRequestAction',  { action: lastAction.action } );
	}
	if (this.algorithm === 'random') {
		let gameState = this.game.gameState;
		assert(gameState, 'random bot requires an access to the game state');
		if (gameState.checkOutcome() !== undefined) return;

		let possibleCommands = this.possibleCommands(gameState, myPlayerIndex);

		let n = possibleCommands.length;
		if (n > 0) {
			let command = possibleCommands[getRandomInt(n)];
			if (command.logMessage) console.log(command.logMessage);
			this.execAllMixins('onWSRequestAction',  { action: command } );
		}
	}
}

Master.onGameStart = function(data) {
	this.tryToAct(data);
}

Master.onGameAction = function(data) {
	this.tryToAct(data);
}

module.exports = Master