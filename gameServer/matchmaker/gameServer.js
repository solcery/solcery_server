const Master = {}

Master.onStart = async function(data) {
	let gameInfo = await this.getGameInfo();
	if (!gameInfo) return;
	this.matchmaker = await this.create(Matchmaker, { 
		id: uuid(),
		playerQuantity: gameInfo.playerQuantity ?? 1,
		botFillTimeout: gameInfo.botFillTimeout ?? 30000,
		tickPeriod: gameInfo.tickPeriod ?? 2000,

	});
}

Master.onPlayRequest = function(player) {
	if (!this.matchmaker) return; // TODO
	this.matchmaker.execAllMixins('onPlayerQueued', player);
}

Master.createBot = async function(data) {
	return await this.create(Player, { id: uuid(), bot: true })
}

module.exports = Master
