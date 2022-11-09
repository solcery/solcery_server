const Master = {};

Master.onChallenge = function(data, result) {
	assert(data.server, 'Error in websocket challenge! No server provided!')
	assert(data.pubkey, 'Error in websocket challenge! No pubkey provided!')
	let server = this.core.get(Project, data.server);
	assert(server, `Error in websocket challenge! No server '${data.server}'!`);
}

Master.onConfirmed = function(data) {
	let server = this.core.get(Project, data.server);
	server.execAllMixins('onPlayerSocketConnected', data.pubkey, this);
}

Master.onSocketMessage = function(message) {
	if (!this.player) return;
	let callbackName = 'onSocketRequest' + message.type.charAt(0).toUpperCase() + message.type.slice(1);
	this.player.execAllMixins(callbackName, message.data);
}

module.exports = Master
