const Master = {};

Master.onSocketChallenge = function(wsConnection) {
	this.wsConnection = wsConnection;
}

Master.setStatus = function (status) {
	this.status = status;
	this.execAllMixins('onStatusChanged', status);
	if (!this.wsConnection) return;
	this.wsConnection.send({
		type: 'status',
		status
	})
}

module.exports = Master
