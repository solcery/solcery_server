const Master = {};

Master.onCreate = function(data) {
	if (!data.bot) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.bot = data.bot;
	console.log('I am a bot?', data.bot);
}

Master.onGameAction = function(data) {
	console.log('BOT onGameAction', data.actionLog);
	let lastAction = data.actionLog.pop();
	let myPlayerData = this.game.players.find(p => p.id === this.id);
	assert(myPlayerData);
	let myIndex = myPlayerData.index;
	if (lastAction.player === myIndex) {
		console.log('BOT last action is mine, skipping');
		return;
	}
	this.execAllMixins('onWSRequestAction', lastAction.action);
}

module.exports = Master
