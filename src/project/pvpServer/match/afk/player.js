const Master = {}

Master.onJoinMatch = function(match) {
    for (let player of match.players) {
        if (player.id === this.id) {
            var playerIndex = player.index;
            break;
        }
    }
    assert(playerIndex);
    let content = objget(this.match, 'gameBuild', 'content', 'web');
    if (!content) return;
    let playerSettings = content.players;
    if (!playerSettings) return;
    let { afkAction, afkTimeout } = Object.values(playerSettings).find(player => player.index === playerIndex); 
    if (!afkAction || !afkTimeout) {
        this.afk = undefined;
        return;
    };
    this.afk = {
        action: afkAction,
        timeout: afkTimeout,
    }
    this.afkBrickRuntime = this.match.gameState.auxBrickRuntime();
    this.afkBrickRuntime.addBindings('client',  {
        sendCommand: (commandId, ctx) => this.sendGameCommand(commandId, ctx)
    });
}

Master.onLeaveMatch = function() {
    this.afk = undefined;
}

Master.onTick = function(time) { //TODO: onProcess
    let next = objget(this, 'afk', 'next');
    if (!next) return;
    if (time < next) return;
    this.afk.next = undefined;
    this.afkBrickRuntime.execBrick(this.afk.action);
}

Master.onMatchUpdate = function(data) {
    if (!this.afk) return;
    if (!this.match) return; //TODO ??
    let timeout = this.afkBrickRuntime.execBrick(this.afk.timeout);
    if (timeout > 0) {
        this.afk.next = this.match.started + timeout;
    }
}

module.exports = Master;
