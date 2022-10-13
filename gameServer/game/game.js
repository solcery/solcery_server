const Master = {}

Master.onCreate = function(data) {
	this.actionLog = data.actionLog ?? [];
	this.gameVersion = data.gameVersion;
	this.players = data.players ?? [];
	this.started = data.started;
	this.finished = data.finished;
	this.gameVersion = data.version;
}

Master.start = function(data) {
	this.started = now();
	this.broadcastToPlayers(['id', 'started']);
	this.save();
}

Master.cancel = function(data) {
	// TODO
}

Master.end = function(data) {
	this.finished = now();
	this.save();
	this.delete();
}

Master.getSaveData = function(fields) {
	const defaultFields = [ 'gameVersion', 'started', 'finished', 'actionLog', 'players'];
	let res = {};
	if (!fields) {
		fields = defaultFields;
	}
	if (!fields.includes('id')) {
		fields.unshift('id');
	} 
	for (let field of fields) {
		if (this[field] !== undefined) {
			res[field] = this[field];
		}
	}
	return res;
}

Master.save = function() {
	if (!this.parent.mongo) return;
	let filter = { id: this.id };
	let saveData = this.getSaveData();
	this.parent.mongo.games.replaceOne(filter, saveData);
}

Master.addPlayer = function(player) {
	this.players.push({
		index: this.players.length + 1,
		id: player.id,
	})
	this.save();
	player.execAllMixins('onGameJoined', this);
}

Master.removePlayer = function(player, outcome) {
	let playerData = this.players.find(agent => agent.id === player.id);
	assert(playerData, `Player '${player.id}' does not participate in this game!`);
	this.actionLog.push({
		player: playerData.index,
		action: {
			type: 'leaveGame',
			outcome,
		}
	})
	this.save()
	playerData.outcome = outcome; //Player who sent the outcome means they won't impact the game anymore
	player.execAllMixins('onGameLeft');
	for (let participant of this.players) {
		if (participant.outcome === undefined) {
			this.broadcastToPlayers(['actionLog']);
			return;
		};
	}
	this.end();
}

Master.onPlayerAction = function(player, action) {
	let playerData = this.players.find(agent => agent.id === player.id);
	assert(playerData, `Player '${player.id}' does not participate in this game!`);
	this.actionLog.push({
		player: playerData.index,
		action
	})
	this.save();
	this.broadcastToPlayers([ 'actionLog' ]);
}

Master.broadcastToPlayers = function(fields) {
	let update = this.getSaveData(fields);
	for (let playerData of this.players) {
		if (playerData.outcome) continue;
		let player = this.parent.get(Player, playerData.id);
		if (!player) continue;
		player.execAllMixins('onGameUpdate', update)
	}
}

module.exports = Master
