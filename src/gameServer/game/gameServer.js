const Master = {}

Master.createGame = function(version) {
	return this.create(Game, {
		id: uuid(), 
		version 
	});
}

Master.loadGame = function (data) {
	this.create(Game, data);
}

Master.onMongoReady = function(mongo) {
	if (mongo.id !== 'main') return;
	let games = mongo.games
	.find({ finished: null })
	.toArray().then(games => {
		for (let game of games) {
			this.loadGame(game);
		}
	});
}

module.exports = Master
