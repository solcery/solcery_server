const Master = {}

Master.onJoinMatch = function(match) {
    for (let player of match.players) {
        if (player.id === this.id) {
            var playerIndex = player.index;
            break;
        }
    }
    assert(playerIndex);
    let playerSettings = objget(this.match, 'gameBuild', 'content', 'web', 'players');
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
}

Master.onLeaveMatch = function() {
    this.afk = undefined;
}

Master.onTick = function(time) { //TODO: onProcess
    let next = objget(this, 'afk', 'next');
    if (!next) return;
    if (time < next) return;
    this.afk.next = undefined; 
    let runtime = this.match.gameState.getRuntime();
    let ctx = this.match.gameState.createContext({
        sendCommand: (commandId, objectId) => {
            let action = {
                type: 'gameCommand',
                commandId,
                ctx: {
                    object_id: objectId,
                }
            }
            this.match.execAllMixins('onPlayerAction', this, action)
        }
    });
    runtime.execBrick(this.afk.action, ctx);
}

Master.onMatchUpdate = function(data) {
    if (!this.afk) return;
    if (!this.match) return; //TODO ??
    let ctx = this.match.gameState.createContext();
    let runtime = this.match.gameState.getRuntime();
    let timeout = runtime.execBrick(this.afk.timeout, ctx);
    if (timeout > 0) {
        this.afk.next = this.match.started + timeout;
    }
}

module.exports = Master;
