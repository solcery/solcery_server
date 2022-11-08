const Master = {}

Master.onCreate = function(data) {
    let matches = this.parent.getAll(Match);
    for (let match of matches) {
        if (match.players.find(player => player.id === this.id)) {
            this.match = match;
            this.setStatus('ingame', { matchId: match.id })
            return;
        }
    }
}

Master.onSocketConnected = function(wsConnection) {
    if (!this.match) return;
    this.execAllMixins('onMatchStart', this.match.getSaveData());
}

Master.onJoinMatch = function(match) {
    this.match = match;
    this.setStatus('ingame', { matchId: match.id });
}

Master.onLeaveMatch = function(match) {
    delete this.match;
    this.setStatus('online')
}

Master.onSocketRequestAction = function(data) {
    if (!this.match) return;
    this.match.execAllMixins('onPlayerAction', this, data);
}

Master.onSocketRequestLeaveMatch = function(data) {
    if (!this.match) return;
    this.match.removePlayer(this, data.outcome);
}

Master.onMatchStart = function(data) {
    this.socketMessage('matchStart', data)
}

Master.onMatchAction = function(data) {
    this.socketMessage('matchAction', data)
}

module.exports = Master
