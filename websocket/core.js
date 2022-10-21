const Master = {};

Master.onHttpServerCreated = function(httpServer) {
    this.connections = [];
    this.webSocketTimeout = 1000;
    this.io = require('socket.io')(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    this.io.on('connection', (socket) => {
        try {
            this.connectWebSocket(socket)
        } catch (e) {
            // webSocket.send(`Error: ${e.message}`);
            webSocket.close();
        }
    });
}

Master.connectWebSocket = function(webSocket) {
    this.create(WSConnection, { 
        id: uuid(), 
        webSocket, 
        timeout: this.webSocketTimeout,
    });
}

module.exports = Master
