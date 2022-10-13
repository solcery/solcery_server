const Master = {};

Master.onUserConnected = async function(pubkey) {
	let player = this.get(Player, pubkey);
	if (!player) {
		player = await this.create(Player, { 
			id: pubkey,
			pubkey: pubkey,
		});
	}
	player.execAllMixins('onConnected');
}

module.exports = Master
