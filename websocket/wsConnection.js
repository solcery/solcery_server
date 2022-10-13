const Master = {};

Master.onCreate = function(data) {
    this.webSocket = data.webSocket;
    this.webSocket.on('message', async (message) => {
        try {
            let msg = JSON.parse(message.toString());
            await this.execAllMixins('onSocketMessage', msg)
        } catch (e) {
            this.execAllMixins('onError', e)
        }
    });
    this.webSocket.on('close', () => this.execAllMixins('onDisconnect'))
}

Master.onError = function (err) {
    this.send({
        type: 'error',
        data: err.message,
    })
}

Master.send = function (message) {
    let json = JSON.stringify(message)
    this.webSocket.send(json)
}

Master.close = function (message) {
    this.webSocket.close();
}

Master.onDisconnect = function (data) {
    this.delete();
}

module.exports = Master
