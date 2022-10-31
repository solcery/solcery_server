const Master = {}

Master.onCreate = function(data) {
	if (!data.pubkey) {
		this.disableMixinCallbacks(Master);
	}
}

Master.onWSConnected = function() {
	let forge = this.core.get(Forge, 'forge');
	if (!forge) return;
	forge.getPlayerNfts(this.id).then(nfts => this.execAllMixins('onNftsLoaded', nfts));
}

Master.onNftsLoaded = function(nfts) {
	this.nfts = nfts;
	if (!this.wsMessage) return;
	this.wsMessage('nfts', nfts);
}

module.exports = Master;
