const Master = {}

Master.onMongoReady = async function(mongo) {
	if (mongo.id !== 'main') return;
	let gameInfo = await this.get(Mongo, 'main').gameInfo.findOne({});
	if (!gameInfo) return;
	let playerQuantity = gameInfo.playerQuantity;
	if (!playerQuantity) return;
	let matchmakerSettings = Object.assign({ id: 'main' }, { playerQuantity });
	this.matchmaker = this.create(Matchmaker, matchmakerSettings);
	this.ready = true;
}

Master.createBot = function() {
	return this.create(Player, { id: uuid(), bot: true })
}

Master.onDelete = function() {
	if (!this.matchmaker) return;
	this.matchmaker.delete();
}

module.exports = Master
