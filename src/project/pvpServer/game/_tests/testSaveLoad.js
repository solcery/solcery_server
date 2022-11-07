const db = {};

async function test(testEnv) {
	let core = createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY = 'pubkey';

	core.create(Project, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		db, 
	});
	let pvpServer = core.get(Project, SERVER_NAME);

	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	let game = pvpServer.createGame();
	let gameId = game.id;
	let player1 = pvpServer.get(Player, PUBKEY);
	game.addPlayer(player1);
	game.start();
	let started = game.started;
	player1.execAllMixins('onSocketRequestAction', { type: 'rightClick' });
	pvpServer.delete();

	core.delete();

	core = createCore();
	pvpServer = core.create(Project, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		db, 
	});

 	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	player1 = pvpServer.get(Player, PUBKEY);
	player1.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	game = pvpServer.get(Game, gameId)
	assert(player1);
	assert(game);
	assert(game.actionLog.length = 2);
	assert(game.actionLog[1].ctx.player_index === 1);
	assert(game.id === gameId);
	assert(game.started === started);
}

module.exports = { test }
