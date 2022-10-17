const Master = {}

Master.onMongoReady = function(mongo) {
	let gameInfo = this.getGameInfo().then(gameInfo => {
		if (!gameInfo) return;
		this.matchmaker = this.create(Matchmaker, { 
			id: 'main',
			playerQuantity: gameInfo.playerQuantity ?? 1,
			botFillTimeout: gameInfo.botFillTimeout ?? 30000,
			tickPeriod: gameInfo.tickPeriod ?? 2000,
		});
	});
}

Master.createBot = function() {
	return this.create(Player, { id: uuid(), bot: true })
}

module.exports = Master
