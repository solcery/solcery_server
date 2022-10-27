const playerMessages = {}

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	// const GAME_NAME = 'game_lightmor'
	const GAME_NAME = 'game_polygon'
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';

	let real_game = true;
	if (real_game) {
		await core.create(GameServer, { 
			id: SERVER_NAME, 
			gameId: GAME_NAME,
		});
		console.log("lets try to get a game from mongo db");
	} else {
		core.create(GameServer, { 
			id: SERVER_NAME, 
			gameId: SERVER_NAME, 
			matchmaker: {
				playerQuantity: 2,
				botFillTimeout: 50,
				tickPeriod: 10,
			},
			virtualDb: { 
				gameInfo: [
					{
						playerQuantity: 2,
						botFillTimeout: 50,
						tickPeriod: 10,
					}
				]
			}
		});
		console.log("use virtual db");
	}

	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer);

	await sleep(1000); 	
	let mongo = await gameServer.get(Mongo, 'main');

	const max_attempts = 20; // one sec is not enough, sometimes even 10 secs are not enough :(
	for (let attempts = 0; attempts < max_attempts; attempts++) {
		if (mongo.versions) {
			break;
		}
		console.log("retry getting game from mongo db");
		await sleep(1000);
		mongo = await gameServer.get(Mongo, 'main');
	} 
	assert(mongo.versions, "failed to get a game from mongo db")

	// console.log(mongo);
	// console.log(Object.keys(mongo));

    let version = await mongo.versions.count();
	// console.log(mongo.versions);
    console.log("version", version);

    // let gameVersion = await mongo.versions.findOne({ version });
	// console.log("gameVersion", gameVersion);
    // console.log("web", gameVersion.content.web);

	assert(gameServer);
	let player = await gameServer.create(Player, { id: PUBKEY1, pubkey: PUBKEY1 });
	let bot = await gameServer.create(Player, { id: PUBKEY2, bot: true, behaviour: 'repeatLastAction' });
	let game = await gameServer.createGame();

	await game.addPlayer(player);
	await game.addPlayer(bot);
	await game.start();

	player.execAllMixins('onWSRequestAction', { action: 'playerAction' });
	bot.execAllMixins('onWSRequestAction', { action: 'botAction' });
	bot.execAllMixins('onWSRequestAction', { action: 'botAction' });
	player.execAllMixins('onWSRequestAction', { action: 'playerAction' });

	assert(game.actionLog.length === 7);
}

module.exports = { test }
