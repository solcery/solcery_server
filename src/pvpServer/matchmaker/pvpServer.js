const Master = {}

Master.onGameVersionLoaded = function(gameVersion) {
	let matchmakerContent = objget(gameVersion, 'content', 'matchmaker');
	if (!matchmakerContent) return;
	this.matchmaker = this.create(Matchmaker, {
		id: `matchmaker.${this.id}`,
		gameVersion,
	})
}

Master.createBot = function() { // TODO: move to bot module
	return this.create(Player, { id: uuid(), bot: true })
}

Master.onDelete = function() {
	if (!this.matchmaker) return;
	this.matchmaker.delete();
}

module.exports = Master
