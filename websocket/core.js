const Master = {};

Master.onCreate = function(data) {
    this.connections = [];
    this.webSocketTimeout = 100;
    assert(this.app)
    this.webSocketServer = require('http').createServer(this.app);
    this.io = require('socket.io')(this.webSocketServer, {
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
    this.webSocketServer.listen(process.env.PORT || 5000); 
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
