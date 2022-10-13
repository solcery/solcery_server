const Master = {}

Master.createGame = async function() {
	let game = await this.create(Game, { id: uuid() });
	return game;
}

Master.loadGame = async function (data) {
	await this.create(Game, data);
}

Master.onStart = async function(data) {
	if (!this.mongo) return;
	let games = this.mongo.games.find({
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
