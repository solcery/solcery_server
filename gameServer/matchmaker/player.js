const Master = {}

Master.onWSRequestLeaveQueue = async function(data) {
    if (objget(this, 'status', 'code') !== 'queued') return;
    await this.parent.execAllMixins('onLeaveQueueRequest', this);
}

Master.onWSRequestJoinQueue = async function(data) {
    if (objget(this, 'status', 'code') !== 'online') return; // TODO: error
    await this.parent.execAllMixins('onJoinQueueRequest', this);
}

module.exports = Master
