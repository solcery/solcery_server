const Master = {}

Master.onCreate = function(data) {
    let matches = this.parent.getAll(Match);
    for (let match of matches) {
        if (match.players.find(player => player.id === this.id && !player.left)) {
            this.execAllMixins('onJoinMatch', match);
            return;
        }
    }
}

Master.onSocketConnected = function(wsConnection) {
    if (!this.match) return;
    this.execAllMixins('onMatchUpdate', this.match.getSaveData());
}

Master.onJoinMatch = function(match) {
    this.match = match;
    this.setStatus('ingame', { matchId: match.id });
}

Master.onLeaveMatch = function(match) {
    this.match = undefined;
    this.setStatus('online')
}

Master.onSocketRequestAction = function(data) {
    if (!this.match) return;
    this.match.execAllMixins('onPlayerAction', this, data); // TODO sendGameCommand
}

Master.onSocketRequestLeaveMatch = function() {
    if (!this.match) return;
    this.match.removePlayer(this);
}

Master.onMatchUpdate = function(data) {
    data.time = this.time();
    this.socketMessage('matchUpdate', data)
}

Master.sendGameCommand = function(commandId, ctx) {
    if (!this.match) return;
    let action = {
        type: 'gameCommand',
        commandId,
        ctx,
    }
    this.match.execAllMixins('onPlayerAction', this, action)
}

module.exports = Master
