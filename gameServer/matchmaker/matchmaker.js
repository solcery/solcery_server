const Master = {}

Master.onCreate = function(data) {
	this.playerQuantity = data.playerQuantity;
	this.botFillTimeout = data.botFillTimeout;
	this.queue = [];
	this.tickPeriod = data.tickPeriod ?? 1000;
	setInterval( () => { this.execAllMixins('onTick') }, this.tickPeriod);
}

Master.onTick = function() {
	this.checkQueue();
}

Master.createGame = function() {
	const game = this.parent.createGame();
	let selectedPlayers = this.queue.splice(0, this.playerQuantity);
	for (let { playerId } of selectedPlayers) {
		let player = this.parent.get(Player, playerId);
		assert(player, `Matchmaking: Error creating game - no player '${playerId}'!`);
		game.addPlayer(player);
	}
	game.start(); // TODO: move to game?
}

Master.checkQueue = function() {
	if (this.queue.length === 0) return;
	if (this.queue.length >= this.playerQuantity) {
		this.createGame();
		return;
	}
	if (!this.botFillTimeout) return;
	if (Date.now() - this.queue[0].time >= this.botFillTimeout) {
		let botsQuantity = this.playerQuantity - this.queue.length;
		for (let i = 0; i < botsQuantity; i++) {
			let bot = this.parent.createBot();
			this.queue.push({
				playerId: bot.id,
				time: Date.now(),
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
	this.queue.push({
		playerId: player.id,
		time: Date.now(),
	})
	player.setStatus('queued', { time: Date.now() })
	this.checkQueue();
}

Master.onPlayerLeft = function(player) {
	let index = this.queue.findIndex(queueEntry => queueEntry.playerId === player.id);
	if (index > -1) {
		this.queue.splice(index, 1);
	}
	player.setStatus('online')
}

module.exports = Master
