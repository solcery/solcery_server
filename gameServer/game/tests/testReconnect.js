const clientPlayer = {
	gameMessages: [],
}

const mixins = [
	{
		dweller: Player,
		mixin: {
			_name: 'Test player message receiver',
			onStatusChanged: function(status) {
				clientPlayer.status = status;
			},
			onGameUpdate: function(message) {
				clientPlayer.gameMessages.push(message)
			},
		}
	}
]

async function test() {
	let core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY = 'pubkey';

	await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		virtualDb: true, 
	});
	let gameServer = core.get(GameServer, SERVER_NAME);

	await gameServer.execAllMixins('onUserConnected', PUBKEY);
	assert(clientPlayer.status.status === 'online');
	let game = await gameServer.createGame();
	let player = gameServer.get(Player, PUBKEY);
	await game.addPlayer(player);
	assert(clientPlayer.status.status === 'ingame' && clientPlayer.status.gameId === game.id);
	assert(clientPlayer.gameMessages.length === 1);
	await game.start();
	assert(clientPlayer.gameMessages.length === 2);
	await player.execAllMixins('onWSRequestAction', { type: 'leftClick' });

	// player reconnects on their side

	delete clientPlayer.status;
	await gameServer.execAllMixins('onUserConnected', PUBKEY);
	assert(clientPlayer.status.status === 'ingame' && clientPlayer.status.gameId === game.id);
	assert(clientPlayer.gameMessages.length === 4);
	await player.execAllMixins('onWSRequestAction', { type: 'rightClick' });

	// deleting player on server then reconnecting
	delete clientPlayer.status;
	await player.delete();
	await gameServer.execAllMixins('onUserConnected', PUBKEY);
	assert(clientPlayer.status.status === 'ingame' && clientPlayer.status.gameId === game.id);
	assert(clientPlayer.gameMessages.length === 6);

	// player leaves game
	await player.execAllMixins('onWSRequestLeaveGame', { outcome: 1 });
	assert(clientPlayer.status.status === 'online')
}

module.exports = { test, mixins }
