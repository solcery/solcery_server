const Master = {}

Master.onCreate = function(data) {
	this.playerQuantity = data.playerQuantity;
	this.botFillTimeout = data.botFillTimeout;
	this.queue = [];
	if (data.tickPeriod) {
		setInterval( () => { this.execAllMixins('onTick') }, data.tickPeriod);
	}
}

Master.onTick = function() {
	this.checkQueue();
}

Master.createGame = async function() {
	const game = await this.parent.createGame();
	let queuePlayers = this.queue.splice(0, this.playerQuantity);
	for (let { playerId } of queuePlayers) {
		let player = this.parent.get(Player, playerId);
		assert(player, `Matchmaking: Error creating game - no player '${playerId}'!`);
		game.addPlayer(player);
	}
}

Master.checkQueue = async function() {
	if (this.queue.length === 0) return;
	if (this.queue.length >= this.playerQuantity) {
		await this.createGame();
		return;
	}
	if (!this.botFillTimeout) return;
	if (Date.now() - this.queue[0].time >= this.botFillTimeout) {
		let botsQuantity = this.playerQuantity - this.queue.length;
		for (let i = 0; i < botsQuantity; i++) {
			let bot = await this.parent.createBot();
			this.queue.push({
				playerId: bot.id,
				time: Date.now(),
			})
		}
		this.createGame();
	}
}

Master.onPlayerQueued = async function(player) {
	this.queue.push({
		playerId: player.id,
		time: Date.now(),
	})
	player.setStatus({
		status: 'queued',
		time: Date.now(),
	})
	await this.checkQueue();
}

Master.onPlayerLeft = function(player) {
	let index = this.queue.findIndex(queueEntry => queueEntry.playerId === playerId);
	if (index > -1) {
		this.queue.splice(index, 1);
	}
	player.setStatus({
		status: 'online',
	})
}

module.exports = Master
