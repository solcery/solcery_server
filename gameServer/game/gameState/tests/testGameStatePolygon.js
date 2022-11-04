const { SummonerInteractor } = require('../utils/summonerInteractor');


async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const GAME_NAME = 'game_polygon'
	const PUBKEY1 = 'PlayerOne';
	const PUBKEY2 = 'PlayerTwo';

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

	// const data = JSON.stringify(content, null, 4);
	// console.log(data);
	// let fs = require('fs');
	// await fs.writeFileSync('polygon_content.json', data,
	// 	err => {
	// 	if (err) {
	// 	  throw err
	// 	}
	// 	console.log('JSON data is saved.')
	//   }
	// );
	// return;
	// console.log(content);

	let playerOne = await gameServer.create(Player, { 
		id: PUBKEY1, 
		pubkey: PUBKEY1,
	});
	let playerTwo = await gameServer.create(Player, { 
		id: PUBKEY2, 
		pubkey: PUBKEY2, 
	});

	let game = await gameServer.createGame();
	let gameState = game.create(GameState, {content: content, seed: 0 });
    game.gameState = gameState;

	await game.addPlayer(playerOne);
	await game.addPlayer(playerTwo);
	await game.start();

	let summonerInteractor = new SummonerInteractor(game);

	/* Going through MENU and choose a hero */

	let gameAttrs = gameState.inner.attrs;

	summonerInteractor.chooseHero(playerOne);
	summonerInteractor.chooseHero(playerTwo);

	assert(gameAttrs.game_mode === 1);

	/* test End Turn Buttons */

	assert(gameAttrs.current_player == 1);
	summonerInteractor.endTurn(playerOne);
	assert(gameAttrs.current_player == 2);
	summonerInteractor.endTurn(playerTwo);
	assert(gameAttrs.current_player == 1);

	/* play random actions */

	players = [playerOne, playerTwo];
	while (!summonerInteractor.gameFinished()) {
		player = players[gameAttrs.current_player - 1];
		summonerInteractor.useHand(player);
		summonerInteractor.useShop(player);
		summonerInteractor.endTurn(player);
	}

	console.log(game.actionLog);
}

module.exports = { test }
