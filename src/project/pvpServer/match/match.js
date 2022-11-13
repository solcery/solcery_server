const Master = {}

Master.onCreate = function(data) {
	this.actionLog = data.actionLog ?? [];
	this.players = data.players ?? [];
	this.started = data.started;
	this.finished = data.finished;
	this.version = data.version;
	this.gameBuild = data.gameBuild;
	this.seed = data.seed ?? Math.floor(Math.random() * 256);	
}

Master.addAction = function(action, broadcast) {
	action.id = this.actionLog.length;
	this.actionLog.push(action);
	this.execAllMixins('onAction', action);
	if (!this.started) return;
	this.execAllPlayers('onMatchAction', this.getSaveData([ 'actionLog' ]));
}

Master.start = function(data) {
	assert(!this.started);
	this.addAction({ 
		id: this.actionLog.length,
		type: 'init',
	});
	this.started = this.time();
	this.save();
	this.execAllMixins('onStart');
	this.execAllPlayers('onMatchStart', this.getSaveData());
}

Master.end = function(data) {
	this.finished = this.time();
	this.save();
	this.delete();
}

Master.getSaveData = function(fields) {
	const defaultFields = [ 'id', 'version', 'started', 'finished', 'actionLog', 'players', 'seed' ];
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
	let filter = { id: this.id };
	let saveData = this.getSaveData();
	this.parent.gameDb.matches.replaceOne(filter, saveData);
}

Master.addPlayer = function(player, data = {}) {
	assert(!this.started, `Impossible to add player. Match ${this.id} is already started.`);
	let index = this.players.length + 1;
	this.players.push({
		index,
		id: player.id,
		nfts: data.nfts,
		bot: player.bot,
	})
	this.save();
	player.execAllMixins('onJoinMatch', this, index);
}

Master.removePlayer = function(player, outcome) {
	let playerData = this.players.find(agent => agent.id === player.id);
	assert(playerData, `Player '${player.id}' does not participate in this game!`);
	this.actionLog.push({
		id: this.actionLog.length,
		player: playerData.id,
		type: 'leaveGame',
		outcome,
	})
	this.save()
	playerData.outcome = outcome; //Player who sent the outcome means they won't impact the game anymore
	player.execAllMixins('onLeaveMatch');
	for (let participant of this.players) {
		if (participant.outcome === undefined) {
			this.execAllPlayers('onMatchAction', this.getSaveData(['actionLog']));
			return;
		};
	}
	this.end();
}

Master.onPlayerAction = function(player, action) {
	let playerData = this.players.find(agent => agent.id === player.id);
	assert(playerData, `Player '${player.id}' does not participate in this game!`);
	objset(action, playerData.index, 'ctx', 'player_index');
	this.addAction({
		player: playerData.id,
		...action,
	})
	this.save();
}

Master.execAllPlayers = function(callbackName, data) {
	for (let playerData of this.players) {
		if (playerData.outcome !== undefined) continue;
		let player = this.parent.get(Player, playerData.id);
		if (!player) continue;
		player.execAllMixins(callbackName, data)
	}
}

module.exports = Master
