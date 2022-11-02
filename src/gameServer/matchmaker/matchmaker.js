const Master = {}

Master.onCreate = function(data) {
	this.gameVersion = data.gameVersion;
	let content = objget(data.gameVersion, 'content', 'matchmaker');
	this.playerQuantity = Object.keys(content.players).length;
	this.botFillTimeout = objget(content, 'matchmaker', 'botFillTimeout');
	let supportedCollections = objget(data.gameVersion, 'content', 'matchmaker', 'collections');
	if (supportedCollections) {
		this.collections = Object.values(supportedCollections).map(c => c.collection);
	}
	this.queue = [];
}

Master.onTick = function(time) {
	this.checkQueue(time);
}

Master.createGame = function() {
	const game = this.parent.createGame(this.gameVersion.version);
	let selectedPlayers = this.queue.splice(0, this.playerQuantity);
	for (let queueEntry of selectedPlayers) {
		game.addPlayer(queueEntry.player, {
			nfts: queueEntry.nfts,
		});
	}
	game.start();
}

Master.checkQueue = function(time) {
	if (this.queue.length === 0) return;
	if (this.queue.length >= this.playerQuantity) {
		this.createGame();
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
		this.createGame();
	}
}

Master.onDelete = function() {
	for (let playerData of this.queue) {
		let player = this.parent.get(Player, playerData.id);
		this.execAllMixins('onPlayerLeft', player);
	}
}

Master.onPlayerQueued = function(player) {
	if (player.nfts && this.collections) {
		var nfts = player.nfts.filter(nft => this.collections.includes(nft.collection));
	}
	let time = this.time();
	this.queue.push({
		player,
		time,
		nfts,
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
