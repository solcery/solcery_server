const Master = {}

Master.createGame = async function(data) {
	let version;
	if (data && data.version) {
		version = data.version;
	} else {
		version = await this.mongo.versions.find().sort({ contentVersion :-1 }).limit(1);
	}
	let game = await this.create(Game, Object.assign({ id: uuid() }, data ));
	return game;
}

Master.loadGame = async function (data) {
	await this.create(Game, data);
}

Master.onStart = async function(data) {
	if (!this.mongo) return;
	let games = await this.mongo.games.find({
		finished: null,
	}).toArray();
	for (let game of games) {
		await this.loadGame(game);
	}
}

Master.onDelete = function(data) {

}

Master.saveGame = function(data) {
	
}

module.exports = Master
