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

Master.onWSConnected = async function(wsConnection) {
    if (!this.game) return;
    await this.execAllMixins('onGameStart', this.game.getSaveData());
}

Master.onGameJoined = function(game) {
    this.game = game;
    this.setStatus('ingame', { gameId: game.id });
}

Master.onGameLeft = function(game) {
    delete this.game;
    this.setStatus('online')
}

Master.onWSRequestAction = function(data) {
    if (!this.game) return;
    this.game.execAllMixins('onPlayerAction', this, data);
}

Master.onWSRequestLeaveGame = function(data) {
    if (!this.game) return;
    this.game.removePlayer(this, data.outcome);
}

Master.onGameStart = function(data) {
    this.wsMessage('gameStart', data)
}

Master.onGameAction = function(data) {
    this.wsMessage('gameAction', data)
}

module.exports = Master
