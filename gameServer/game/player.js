const Master = {}

Master.onConnected = function(data) {
    let games = this.parent.getAll(Game);
    for (let game of games) {
        if (game.players.find(player => player.id === this.id)) {
            this.execAllMixins('onGameJoined', game)
            return;
        }
    }
    this.setStatus({
        status: 'online'
    })
}

Master.onGameJoined = function(game) {
    this.game = game;
    this.setStatus({
        status: 'ingame',
        gameId: game.id,
    })
    this.execAllMixins('onGameUpdate', game.getSaveData());
}

Master.onGameLeft = function(game) {
    delete this.game;
    this.setStatus({
        status: 'online'
    })
}

Master.onWSRequestAction = function(data) {
    if (!this.game) return;
    this.game.execAllMixins('onPlayerAction', this, data);
}

Master.onWSRequestLeaveGame = function(data) {
    if (!this.game) return;
    this.game.removePlayer(this, data.outcome);
}

Master.onGameUpdate = function(data) {
    if (!this.wsConnection) return;
    this.wsConnection.send({
        type: 'gameUpdate',
        data,
    })
}

module.exports = Master
