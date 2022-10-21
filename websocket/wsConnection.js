const Master = {};

Master.onCreate = function(data) {
    this.webSocket = data.webSocket;
    assert(this.webSocket)
    this.webSocket.on('message', (message, callback) => {
        try {
            this.execAllMixins('onSocketMessage', message)
        } catch (err) {
            this.webSocket.emit('message', {
                type: 'error',
                data: err.message,
            })
        }
        if (callback) {
            callback({
                status: true,
            })
        }
    });
    this.webSocket.on('disconnect', () => this.execAllMixins('onDisconnect'));
    sleep(data.timeout).then(() => {
        if (!this.confirmed) this.disconnect();
    })
    
}

Master.onSocketMessage = function(message) {
    if (this.confirmed) return;
    if (message.type !== 'challenge') return;
    this.challenge(message.data);
}

Master.onDelete = function() {
    this.deleting = true;
    this.disconnect();
}

Master.challenge = function (data) {
    try {
        this.execAllMixins('onChallenge', data);
    } catch (e) {
        this.webSocket.emit('exception', e.message);
        this.disconnect();
        return;
    }
    this.confirmed = true;
    if (this.confirmed) {
        this.execAllMixins('onConfirmed', data);
    }
}

Master.send = function (message) {
    this.webSocket.emit('message', message)
}

Master.disconnect = function (message) {
    this.webSocket.disconnect();
}

Master.onDisconnect = function (data) {
    if (this.deleting) return;
    this.delete();
}

module.exports = Master
