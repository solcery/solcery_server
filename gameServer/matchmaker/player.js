const Master = {}

Master.onWSRequestLeaveQueue = function(data) {
    if (objget(this, 'status', 'code') !== 'queued') return;
    assert(this.parent.matchmaker);
    this.parent.matchmaker.execAllMixins('onPlayerLeft', this);
}

Master.onWSRequestJoinQueue = function(data) {
    if (objget(this, 'status', 'code') !== 'online') return; // TODO: error
    assert(this.parent.matchmaker);
    this.parent.matchmaker.execAllMixins('onPlayerQueued', this);
}

module.exports = Master
