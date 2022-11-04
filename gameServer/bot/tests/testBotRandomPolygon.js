const { SummonerExtractor } = require("../../game/gameState/utils/summonerInteractor")

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const GAME_NAME = 'game_polygon'
	const PUBKEY1 = 'botPlayerOne';
	const PUBKEY2 = 'botPlayerTwo';

	await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: GAME_NAME,
		db: GAME_NAME,
	});

	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer);

	await sleep(1000); 	

	let mongo = await gameServer.get(Mongo, "main");
	const max_attempts = 20; // one sec is not enough, sometimes even 10 secs are not enough :(
	for (let attempts = 0; attempts < max_attempts; attempts++) {
		if (mongo.versions) {
			break;
		}
		await sleep(1000);
		mongo = await gameServer.get(Mongo, 'main');
	} 
	assert(mongo.versions, "failed to get a game from mongo db")
    let version = await mongo.versions.count();
	let gameVersion = await mongo.versions.findOne({ version });
	let content = gameVersion.content.web;

	let game = await gameServer.createGame();
	let gameState = game.create(GameState, {content: content, seed: 0 });
    game.gameState = gameState;

	let botPlayerOne = await gameServer.create(Player, { 
		id: PUBKEY1, 
		pubkey: PUBKEY1,
        bot: true,
        algorithm: 'random',
		possibleCommands: SummonerExtractor.possibleCommands,
	});
	let botPlayerTwo = await gameServer.create(Player, { 
		id: PUBKEY2, 
		pubkey: PUBKEY2, 
        bot: true,
        algorithm: 'random',
		possibleCommands: SummonerExtractor.possibleCommands,
	});

	await game.addPlayer(botPlayerOne);
	await game.addPlayer(botPlayerTwo);
	await game.start();

	assert(gameState.inner.attrs.game_mode === 2);
	console.log(gameState.inner.attrs);
}

module.exports = { test }