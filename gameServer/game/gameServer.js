const Master = {}

Master.createGame = function(data = {}) {
	return this.create(Game, Object.assign({ id: uuid() }, data ));
}

Master.loadGame = function (data) {
	this.create(Game, data);
}

Master.onMongoReady = function(mongo) {
	if (mongo.id !== 'main') return;
	// let games = mongo.games
	// .find({ finished: null })
	// .toArray().then(games => {
	// 	for (let game of games) {
	// 		this.loadGame(game);
	// 	}
	// });
	mongo.versions.count().then(res => {
		this.latestVersion = res
	});
}

module.exports = Master
