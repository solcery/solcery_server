const Master = {}

Master.onWSRequestPlay = async function(data) {
    if (objget(this, 'status', 'status') !== 'online') return; // TODO: error
    await this.parent.execAllMixins('onPlayRequest', this);
}

module.exports = Master
