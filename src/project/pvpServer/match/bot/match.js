const Master = {};

Master.onCreate = function(data) {
	this.gameBuild = data.gameBuild ?? this.gameBuild;
	if (!this.players) return;
	for (let playerInfo of this.players) {
		if (!playerInfo.bot) continue;
		if (playerInfo.left) continue;
		let player = this.parent.get(Player, playerInfo.id);
		if (!player) {
			player = this.parent.createBot({ id: playerInfo.id });
		}
		player.execAllMixins('onJoinMatch', this, playerInfo.index);
		player.execAllMixins('onMatchUpdate', this.getSaveData());
	}
}

module.exports = Master;
