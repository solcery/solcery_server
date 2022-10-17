const Master = {};

Master.onCreate = function(data) {
    this.webSocket = data.webSocket;
    this.webSocket.on('message', (message) => {
        try {
            this.execAllMixins('onSocketMessage', message)
        } catch (err) {
            this.send({
                type: 'error',
                data: err.message,
            })
        }
    });
    this.webSocket.on('close', () => this.execAllMixins('onClose'));
    sleep(data.timeout).then(() => {
        if (!this.confirmed) this.close();
    })
    
}

Master.onSocketMessage = function(message) {
    if (this.confirmed) return;
    if (message.type !== 'challenge') return;
    this.challenge(message.data);
}

Master.onDelete = function() {
    this.close();
}

Master.challenge = function (data) {
    let result = { 
        confirmed: true,
    }
    this.execAllMixins('onChallenge', data, result);
    this.confirmed = result.confirmed;  
    if (result.confirmed) {
        this.execAllMixins('onConfirmed', data);
    }
}

Master.send = function (message) {
    this.webSocket.emit('message', message)
}

Master.close = function (message) {
    this.webSocket.disconnect();
}

Master.onClose = function (data) {
    if (this.deleting) return;
    this.delete();
}

module.exports = Master
