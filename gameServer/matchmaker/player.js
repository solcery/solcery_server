const Master = {}

Master.onWSRequestLeaveQueue = async function(data) {
    if (objget(this, 'status', 'code') !== 'queued') return;
    assert(this.parent.matchmaker);
    await this.parent.matchmaker.execAllMixins('onPlayerLeft', this);
}

Master.onWSRequestJoinQueue = async function(data) {
    if (objget(this, 'status', 'code') !== 'online') return; // TODO: error
    assert(this.parent.matchmaker);
    await this.parent.matchmaker.execAllMixins('onPlayerQueued', this);
}

module.exports = Master
