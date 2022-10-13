const Master = {};

Master.onCreate = function(data) {
	this.timeout = 100;
	sleep(this.timeout).then(() => {
		if (!this.player) this.close();
	})
}

Master.challenge = async function(data) {
	if (!data.server || !data.pubkey) return;
	let server = this.core.get(GameServer, data.server);
	assert(server, `Error in websocket challenge! No server '${data.server}'!`);
	await server.execAllMixins('onUserConnected', data.pubkey);
	this.player = server.get(Player, data.pubkey); // ??
	this.player.execAllMixins('onSocketChallenge', this);
}

Master.onSocketMessage = async function(message) {
	if (message.type === 'challenge') {
		await this.challenge(message.data)
		return;	
	}
	if (!this.player) return;
	let callbackName = 'onWSRequest' + message.type.charAt(0).toUpperCase() + message.type.slice(1);
	this.player.execAllMixins(callbackName, message.data);
}

module.exports = Master
