const Master = {}

Master.onMongoReady = async function(mongo) {
	if (mongo.id !== 'main') return;
	let matchmakerData = { id: 'main' };
	let gameInfo = await this.get(Mongo, 'main').gameInfo.findOne({});
	if (!gameInfo) return;
	let matchmakerSettings = Object.assign({ id: 'main' }, gameInfo.matchmakerSettings ?? {} );
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
