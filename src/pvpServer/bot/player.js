const Master = {};

Master.onCreate = function(data) {
	if (!data.bot) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.bot = data.bot;
	this.behaviour = data.behaviour;
	console.log('start a bot that', data.behaviour);
}

Master.onGameAction = function(data) {
	let lastAction = data.actionLog.slice(-1).pop();
	if (!lastAction.playerIndex) { return; }

	let myPlayerData = this.game.players.find(p => p.id === this.id);
	assert(myPlayerData);

	if (this.behaviour === 'repeatLastAction') {
		let myIndex = myPlayerData.index;
		if (lastAction.playerIndex === myIndex) { return; }
		this.execAllMixins('onWSRequestAction',  { action: lastAction.action } );
	}
}

module.exports = Master
