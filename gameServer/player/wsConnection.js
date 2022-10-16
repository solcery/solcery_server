const Master = {};

Master.onChallenge = async function(data, result) {
	assert(data.server, 'Error in websocket challenge! No server provided!')
	assert(data.pubkey, 'Error in websocket challenge! No pubkey provided!')
	let server = this.core.get(GameServer, data.server);
	assert(server, `Error in websocket challenge! No server '${data.server}'!`);
}

Master.onConfirmed = async function(data) {
	let server = this.core.get(GameServer, data.server);
	await server.execAllMixins('onPlayerWSConnected', data.pubkey, this);
}

Master.onSocketMessage = async function(message) {
	if (!this.player) return;
	let callbackName = 'onWSRequest' + message.type.charAt(0).toUpperCase() + message.type.slice(1);
	this.player.execAllMixins(callbackName, message.data);
}

module.exports = Master
