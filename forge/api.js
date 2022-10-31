const Master = { api: {} };

Master.forge = function(params) {
      let forge = this.core.get(Forge, 'forge');
      assert(forge, `API Error: Forge is deactivated`);
      return forge;
}

Master.api['forge.getNfts'] = async function(params) {
	let forge = this.forge(params);
	return forge.getNfts(params.mintPubkeys);
}

Master.api['forge.getPlayerNfts'] = async function(params) {
	let forge = this.forge(params);
	return forge.getPlayerNfts(params.pubkey);
	
}

module.exports = Master;
