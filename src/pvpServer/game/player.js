const Master = {}

Master.onCreate = function(data) {
    let games = this.parent.getAll(Game);
    for (let game of games) {
        if (game.players.find(player => player.id === this.id)) {
            this.game = game;
            this.setStatus('ingame', { gameId: game.id })
            return;
        }
    }
}

Master.onSocketConnected = function(wsConnection) {
    if (!this.game) return;
    this.execAllMixins('onGameStart', this.game.getSaveData());
}

Master.onGameJoined = function(game) {
    this.game = game;
    this.setStatus('ingame', { gameId: game.id });
}

Master.onGameLeft = function(game) {
    delete this.game;
    this.setStatus('online')
}

Master.onSocketRequestAction = function(data) {
    if (!this.game) return;
    this.game.execAllMixins('onPlayerAction', this, data);
}

Master.onSocketRequestLeaveGame = function(data) {
    if (!this.game) return;
    this.game.removePlayer(this, data.outcome);
}

Master.onGameStart = function(data) {
    this.socketMessage('gameStart', data)
}

Master.onGameAction = function(data) {
    this.socketMessage('gameAction', data)
}

module.exports = Master
