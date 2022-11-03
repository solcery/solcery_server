const clientPlayer = {
	status: {},
	gameMessages: [],
}

const mixins = [
	{
		dweller: Player,
		mixinConfig: {
			master: {
				_name: 'Test player message receiver',
				onSocketMessage: function(type, data) {
					if (type === 'playerStatus') {
						clientPlayer.status = data;
					}
					if (type === 'gameAction') {
						clientPlayer.gameMessages.push(data)
					}
					if (type === 'gameStart') {
						clientPlayer.gameMessages.push(data)
					}
				}
			}
		}
	}
]

async function test(testEnv) {
	let core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY = 'pubkey';

	await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		db: {}, 
	});
	let gameServer = core.get(GameServer, SERVER_NAME);

	await gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY)
	let player = await gameServer.get(Player, PUBKEY);
	assert(clientPlayer.status.code === 'online');
	let game = await gameServer.createGame();
	await game.addPlayer(player);
	game.start();
	assert(clientPlayer.status.code === 'ingame' && clientPlayer.status.data.gameId === game.id);
	assert(clientPlayer.gameMessages.length === 1);
	await game.start();
	assert(clientPlayer.gameMessages.length === 2);
	await player.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	assert(clientPlayer.gameMessages.length === 3);
	clientPlayer.gameMessages = [];

	// player reconnects on their side

	delete clientPlayer.status;
	await gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	assert(clientPlayer.status.code === 'ingame' && clientPlayer.status.data.gameId === game.id);
	assert(clientPlayer.gameMessages.length === 1);
	clientPlayer.gameMessages = [];

	// deleting player on server then reconnecting
	delete clientPlayer.status;
	await player.delete();
	await gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	assert(clientPlayer.status.code === 'ingame' && clientPlayer.status.data.gameId === game.id);
	assert(clientPlayer.gameMessages.length === 1);

	// player leaves game
	await player.execAllMixins('onSocketRequestLeaveGame', { outcome: 1 });
	assert(clientPlayer.status.code === 'online')
}

module.exports = { test, mixins }