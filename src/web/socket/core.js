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
            socket.close();
        }
    });
}

Master.connectWebSocket = function(socket) {
    this.create(Socket, { 
        id: uuid(), 
        socket, 
        timeout: this.webSocketTimeout,
    });
}

module.exports = Master
