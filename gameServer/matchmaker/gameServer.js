const Master = {}

Master.onCreate = function(data) {
	let matchmakerSettings = Object.assign({ id: 'main' }, data.matchmaker);
	this.matchmaker = this.create(Matchmaker, matchmakerSettings);
	this.ready = true
}

Master.createBot = function() {
	return this.create(Player, { id: uuid(), bot: true })
}

module.exports = Master
