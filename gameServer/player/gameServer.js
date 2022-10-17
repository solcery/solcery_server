const Master = {};

Master.onPlayerWSConnected = function(pubkey, wsConnection) {
	let player = this.get(Player, pubkey);
	if (!player) {
		player = this.create(Player, {
			id: pubkey,
			pubkey: pubkey,
			status: { // TODO: remove
				code: 'online',
			}
		});
	}
	player.execAllMixins('onWSConnected', wsConnection);
}

module.exports = Master
