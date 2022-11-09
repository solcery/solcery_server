const Master = {}

Master.onCreate = function(data) {
    this.bot = data.bot; // TODO: move to bot module
}

Master.onSocketRequestLeaveQueue = function(data) {
    if (objget(this, 'status', 'code') !== 'queued') return;
    assert(this.parent.matchmaker);
    this.parent.matchmaker.execAllMixins('onPlayerLeft', this);
}

Master.onSocketRequestJoinQueue = function(data) {
    if (objget(this, 'status', 'code') !== 'online') return; // TODO: error
    assert(this.parent.matchmaker);
    this.parent.matchmaker.execAllMixins('onPlayerQueued', this);
}

module.exports = Master
