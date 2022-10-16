const virtualDb = {};

async function test() {
	let core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY = 'pubkey';

	await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		virtualDb, 
	});
	let gameServer = core.get(GameServer, SERVER_NAME);

	await gameServer.execAllMixins('onPlayerWSConnected', PUBKEY);
	let game = await gameServer.createGame();
	let gameId = game.id;
	let player1 = gameServer.get(Player, PUBKEY);
	await game.addPlayer(player1);
	game.start();
	let started = game.started;
	await player1.execAllMixins('onWSRequestAction', { type: 'rightClick' });
	await gameServer.delete();

	core = await createCore();
	gameServer = await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		virtualDb, 
	});

	await gameServer.execAllMixins('onPlayerWSConnected', PUBKEY);
	player1 = gameServer.get(Player, PUBKEY);
	await player1.execAllMixins('onWSRequestAction', { type: 'leftClick' });
	game = gameServer.get(Game, gameId)
	assert(player1);
	assert(game);
	assert(game.actionLog.length = 2);
	assert(game.actionLog[0].player === 1, game.actionLog[1].player === 1);
	assert(game.id === gameId);
	assert(game.started === started);
}

module.exports = { test }
