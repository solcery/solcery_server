const Master = {}

Master.onCreate = function(data) {
	let content = data.matchmakerContent;
	this.version = data.version;
	this.playerQuantity = Object.keys(content.players).length;
	this.botFillTimeout = objget(content, 'matchmaker', 'botFillTimeout');
	this.queue = [];
}

Master.onTick = function(time) {
	this.checkQueue(time);
}

Master.createMatch = function() {
	const match = this.parent.createMatch({ version: this.version });
	let selectedPlayers = this.queue.splice(0, this.playerQuantity);
	for (let queueEntry of selectedPlayers) {
		match.addPlayer(queueEntry.player, {
			nfts: queueEntry.nfts,
		});
	}
	match.start(); //TODO: move somewhere
}

Master.checkQueue = function(time) {
	if (this.queue.length === 0) return;
	if (this.queue.length >= this.playerQuantity) {
		this.createMatch();
		return;
	}
	if (!this.botFillTimeout) return;
	if (time - this.queue[0].time >= this.botFillTimeout) {
		let botsQuantity = this.playerQuantity - this.queue.length;
		for (let i = 0; i < botsQuantity; i++) {
			let player = this.parent.createBot();
			this.queue.push({
				player,
				time,
			})
		}
		this.createMatch();
	}
}

Master.onDelete = function() {
	for (let playerData of this.queue) {
		let player = this.parent.get(Player, playerData.id);
		this.execAllMixins('onPlayerLeft', player);
	}
}

Master.onPlayerQueued = function(player) {
	let time = this.time();
	this.queue.push({
		player,
		time,
		nfts: player.nfts,
	})
	player.setStatus('queued', { time })
	this.checkQueue(this.time());
}

Master.onPlayerLeft = function(player) {
	let index = this.queue.findIndex(queueEntry => queueEntry.player.id === player.id);
	if (index > -1) {
		this.queue.splice(index, 1);
	}
	player.setStatus('online')
}

module.exports = Master
