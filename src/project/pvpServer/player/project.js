const Master = {};

Master.onCreate = function(data) {
	if (!data.pvpServer) {
        this.disableMixinCallbacks(Master);
        return;
    }
}

Master.onPlayerSocketConnected = function(pubkey, socket) {
	let player = this.get(Player, pubkey);
	if (!player) {
		player = this.create(Player, {
			id: pubkey,
			pubkey: pubkey,
		});
		if (!player.status) {
			player.setStatus('online');
		}
	}
	player.execAllMixins('onSocketConnected', socket);
}

module.exports = Master
