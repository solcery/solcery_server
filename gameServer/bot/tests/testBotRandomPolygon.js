const { SummonerExtractor } = require("../../game/gameState/utils/summonerInteractor")
const { performance } = require('perf_hooks');

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

async function playGame(gameServer, content) {
	const PUBKEY1 = 'botPlayerOne' + getRandomInt(1024 * 1024 * 1024);
	const PUBKEY2 = 'botPlayerTwo' + getRandomInt(1024 * 1024 * 1024);

	let botPlayerOne = await gameServer.create(Player, { 
		id: PUBKEY1, 
		pubkey: PUBKEY1,
        bot: true,
        algorithm: 'random',
		log: false,
		possibleCommands: SummonerExtractor.possibleCommands,
	});
	let botPlayerTwo = await gameServer.create(Player, { 
		id: PUBKEY2, 
		pubkey: PUBKEY2, 
        bot: true,
        algorithm: 'random',
		log: false,
		possibleCommands: SummonerExtractor.possibleCommands,
	});

	let game = await gameServer.createGame();
	let gameState = game.create(GameState, {content: content, seed: 0 });
    game.gameState = gameState;

	await game.addPlayer(botPlayerOne);
	await game.addPlayer(botPlayerTwo);
	await game.start();

	assert(gameState.inner.attrs.game_mode === 2);
	let outcome = gameState.checkOutcome();
	assert(outcome !== 0);
	return outcome;
}


async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const GAME_NAME = 'game_polygon'

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
	assert(version === 7);

	let nGames = 1000;
	let firstPlayerWins = 0;
	let elapsed = 0;

	for (let i = 0; i < nGames; i++) {
		let tp = performance.now();
		result = await playGame(gameServer, content);
		elapsed += performance.now() - tp;

		if (result === 1) {
			firstPlayerWins += 1;
			console.log("Player 1 wins")
		} else {
			console.log("Player 2 wins")
		}
	}

	console.log("Player 1 winrate: " + firstPlayerWins + " / " + nGames);
	console.log("average game execution time: " + Math.floor(elapsed / nGames) + "ms");
}

module.exports = { test }