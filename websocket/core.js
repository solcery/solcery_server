const Master = {};

Master.onCreate = function(data) {
    const WebSocket = require('ws');
    this.connections = [];
    this.webSocketTimeout = 100;
    this.webSocketServer = new WebSocket.Server({ port: 7000 });
    this.webSocketServer.on('connection', (webSocket) => {
        try {
            this.connectWebSocket(webSocket)
        } catch (e) {
            webSocket.send(`Error: ${e.message}`);
            webSocket.close();
        }
    });
}

Master.onDelete = function(data) {
    if (!this.webSocketServer) return;
    this.webSocketServer.close();
}

Master.connectWebSocket = function(webSocket) {
    this.create(WSConnection, { 
        id: uuid(), 
        webSocket, 
        timeout: this.webSocketTimeout,
    });
}

module.exports = Master
