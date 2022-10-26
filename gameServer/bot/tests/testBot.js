const playerMessages = {}

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';

	await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: 'game_polygon'
	});



	let gameServer = core.get(GameServer, SERVER_NAME);

	await sleep(1000);
    version = await gameServer.get(Mongo, 'main').versions.count();
    console.log(version)
    let gameVersion = await gameServer.get(Mongo, 'main').versions.findOne({ version });
    console.log(gameVersion.content.web)


	// assert(gameServer);
	// let player = await gameServer.create(Player, { id: PUBKEY1, pubkey: PUBKEY1 });
	// let bot = await gameServer.create(Player, { id: PUBKEY2, bot: true });
	// let game = await gameServer.createGame();

	// await game.addPlayer(player);
	// await game.addPlayer(bot);
	// await game.start();

	// player.execAllMixins('onWSRequestAction', { action: 'testAction' });
	// bot.execAllMixins('onWSRequestAction', { action: 'testAction' });
	// bot.execAllMixins('onWSRequestAction', { action: 'testAction' });
	// player.execAllMixins('onWSRequestAction', { action: 'testAction' });

	// console.log('ACTIONLOG: ', game.actionLog)
	// assert(game.actionLog.length === 7);
}

module.exports = { test }
