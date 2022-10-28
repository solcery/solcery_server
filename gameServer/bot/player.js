const Master = {};

Master.onCreate = function(data) {
	if (!data.bot) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.bot = data.bot;
	this.algorithm = data.algorithm;
	// console.log('start a bot that', data.algorithm);
}

Master.onGameAction = function(data) {
	let lastAction = data.actionLog.slice(-1).pop();
	if (!lastAction.player) { return; }

	let myPlayerData = this.game.players.find(p => p.id === this.id);
	// console.log("myPlayerData", myPlayerData);
	// index vs id ?
	assert(myPlayerData);

	if (this.algorithm === 'repeatLastAction') {
		let myIndex = myPlayerData.id;
		if (lastAction.player === myIndex) { return; }
		this.execAllMixins('onWSRequestAction',  { action: lastAction.action } );
	}
}

module.exports = Master
