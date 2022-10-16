const Master = {};

Master.wsMessage = function(type, data) {
	this.execAllMixins('onWSMessage', type, data);
	if (!this.wsConnection) return;
	this.wsConnection.send({ type, data });
}

Master.onWSConnected = function(wsConnection) {
	this.wsConnection = wsConnection;
	if (wsConnection) {
		wsConnection.player = this; // TODO
	}
	this.wsMessage('playerStatus', this.status); 
}

Master.onCreate = function(data) {
	this.status = data.status;
}

Master.setStatus = function (code, data) {
	this.status = {
		code,
		data
	};
	this.wsMessage('playerStatus', this.status);
}

module.exports = Master
