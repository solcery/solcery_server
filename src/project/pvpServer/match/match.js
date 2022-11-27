const Master = {}

Master.onCreate = function(data) {
	this.actionLog = data.actionLog ?? [];
	this.players = data.players ?? [];
	this.started = data.started;
	this.finished = data.finished;
	this.version = data.version;
	this.gameBuild = data.gameBuild ?? this.gameBuild;
	this.seed = data.seed ?? Math.floor(Math.random() * 256);
	this.result = data.result;
}

Master.onPostCreate = function(data) {
	for (let playerInfo of this.players) {
		if (playerInfo.left) continue;
		let player = this.parent.get(Player, playerInfo.id);
		if (!player) {
			player = this.parent.create(Player, { 
				id: playerInfo.id,
				bot: playerInfo.bot, 
			});
			player.execAllMixins('onJoinMatch', this, playerInfo.index);
		}
	}
}

Master.addAction = function(action) {
	action.id = this.actionLog.length;
	action.time = this.time() - this.started;
	this.actionLog.push(action);
	this.execAllMixins('onAction', action);
	if (action.type === 'init') return; // TODO
	this.execAllPlayers('onMatchUpdate', this.getSaveData([ 'actionLog' ]));
}

Master.onDelete = function() {
	this.execAllPlayers('onLeaveMatch');
}

Master.start = function(data) {
	assert(!this.started);
	this.started = this.time();
	this.addAction({ 
		id: this.actionLog.length,
		type: 'init',
		time: 0,
	});
	this.save(true);
	this.execAllPlayers('onMatchUpdate', this.getSaveData());
}

Master.end = function(data) {
	this.finished = this.time();
	this.execAllPlayers('onLeaveMatch');
	this.save();
	this.delete();
}

Master.getSaveData = function(fields) {
	const defaultFields = [ 'id', 'version', 'started', 'finished', 'actionLog', 'players', 'seed', 'result'];
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

Master.save = async function(upsert = false) {
	let filter = { id: this.id };
	this.parent.gameDb.matches.updateOne(filter, { '$set': this.getSaveData() }, { upsert });
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

Master.removePlayer = function(player) {
	let playerData = this.players.find(agent => agent.id === player.id);
	assert(playerData, `Player '${player.id}' does not participate in this game!`);
	let leaveGameCommandId = objget(this.gameBuild, 'content', 'web', 'gameSettings', 'leaveGameCommandId');
	if (leaveGameCommandId) {
		this.addAction({
			player: playerData.id,
			type: 'gameCommand',
			commandId: leaveGameCommandId,
			ctx: {
				player_index: playerData.index,
			}
		})
	}
	this.addAction({
		player: playerData.id,
		type: 'leaveMatch',
	});
	playerData.left = true;
	player.execAllMixins('onLeaveMatch');
	let activePlayers = this.players.filter(p => !p.left).length;
	if (activePlayers > 0) {
		this.save();
	} else {
		this.end();
	}
}

Master.onPlayerAction = function(player, action) {
	let playerData = this.players.find(playerData => playerData.id === player.id);
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
		if (playerData.left) continue;
		let player = this.parent.get(Player, playerData.id);
		if (!player) continue;
		player.execAllMixins(callbackName, data)
	}
}

module.exports = Master
