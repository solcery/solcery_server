const db = {};

async function test(testEnv) {
	let core = createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY = 'pubkey';

	core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		db, 
	});
	let gameServer = core.get(GameServer, SERVER_NAME);

	gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	let game = gameServer.createGame();
	let gameId = game.id;
	let player1 = gameServer.get(Player, PUBKEY);
	game.addPlayer(player1);
	game.start();
	let started = game.started;
	player1.execAllMixins('onSocketRequestAction', { type: 'rightClick' });
	gameServer.delete();

	core.delete();

	core = createCore();
	gameServer = core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		db, 
	});

 	gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	player1 = gameServer.get(Player, PUBKEY);
	player1.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	game = gameServer.get(Game, gameId)
	assert(player1);
	assert(game);
	assert(game.actionLog.length = 2);
	assert(game.actionLog[1].ctx.player_index === 1);
	assert(game.id === gameId);
	assert(game.started === started);
}

module.exports = { test }
