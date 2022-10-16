const Master = {}

Master.createGame = async function(data = {}) {
	if (!data.version) {
		data.version = await this.mongo.versions.count();
		// let latest = await this.mongo.versions.find().sort({ version :-1 }).limit(1).toArray();
		// data.version = latest[0].version;
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

module.exports = Master
