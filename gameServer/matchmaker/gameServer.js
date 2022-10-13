const Master = {}

Master.onCreate = async function(data) {
	if (!data.matchmaker) return;
	this.matchmaker = await this.create(Matchmaker, Object.assign({ id: uuid() }, data.matchmaker));
}

Master.onPlayRequest = function(player) {
	if (!this.matchmaker) return; // TODO
	this.matchmaker.execAllMixins('onPlayerQueued', player);
}

Master.createBot = async function(data) {
	return await this.create(Player, { id: uuid(), bot: true })
}

module.exports = Master
