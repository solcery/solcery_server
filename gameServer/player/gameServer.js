const Master = {};

Master.onLoginApiCommand = async function(result, params) {
    let player = this.get(Player, params.pubkey);
    assert(!player, 'Login error: already logged in!');
    this.create(Player, {
        id: params.pubkey
    })
}

module.exports = Master
