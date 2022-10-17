const Master = {}

Master.onMongoReady = function(mongo) {
	let gameInfo = this.getGameInfo().then(gameInfo => {
		if (!gameInfo) return;
		this.matchmaker = this.create(Matchmaker, { 
			id: 'main',
			playerQuantity: 2,
			botFillTimeout: gameInfo.botFillTimeout ?? 30000,
			tickPeriod: gameInfo.tickPeriod ?? 2000,
		});
		this.ready = true; // TODO: proper loading
	});
}

Master.createBot = function() {
	return this.create(Player, { id: uuid(), bot: true })
}

module.exports = Master
