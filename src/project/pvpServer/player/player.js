const Master = {};

Master.socketMessage = function(type, data) {
	this.execAllMixins('onSocketMessage', type, data);
	if (!this.socket) return;
	this.socket.send({ type, data });
}

Master.onSocketConnected = function(socket) {
	this.socket = socket;
	if (socket) {
		socket.player = this; // TODO
	}
	this.socketMessage('playerStatus', this.status); 
}

Master.onCreate = function(data) {
	this.pubkey = data.pubkey;
}

Master.setStatus = function (code, data) {
	this.status = {
		code,
		data
	};
	this.execAllMixins('onStatusChanged')
	this.socketMessage('playerStatus', this.status);
}

module.exports = Master
