const { Collection, ConnectionClosedEvent } = require("mongodb");

const playerMessages = {}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const GAME_NAME = 'game_lightmor'
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';

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
		console.log("retry getting game from mongo db");
		await sleep(1000);
		mongo = await gameServer.get(Mongo, 'main');
	} 
	assert(mongo.versions, "failed to get a game from mongo db")
    let version = await mongo.versions.count();
	let gameVersion = await mongo.versions.findOne({ version });
    console.log("game version", version);


	let playerOne = await gameServer.create(Player, { 
		id: PUBKEY1, 
		pubkey: PUBKEY1 
	});
	let playerTwo = await gameServer.create(Player, { 
		id: PUBKEY2, 
		pubkey: PUBKEY2 
	});
	let game = await gameServer.createGame();

	await game.addPlayer(playerOne);
	await game.addPlayer(playerTwo);
	await game.start();

	/* Test GameState creation */

	let content = gameVersion.content.web;
	console.log(content);
	let gameState = game.create(GameState, {content: content, seed: 0 });

	// console.log(gameState.inner.attrs);
	assert(gameState);

	console.log("gameState was created");

	/* Test GameState start */

	gameState.start(game.players);
	console.log(gameState.inner.objects);
	// assert(Object.keys(gameState.inner.objects).length == 5);
	console.log("gameState was launched");

	/* Test Apply Command */

	console.log("game attrs", gameState.inner.attrs);

	// do nothing button
	let rightButtonClick = {
		commandId: 9, 
		scopeVars: { object_id: 1 }
	}
	// get one point button
	let leftButtonClick = {
		commandId: 9, 
		scopeVars: { object_id: 4 }
	}

	let command = rightButtonClick;
	while(!gameState.inner.checkOutcome()) {
		if (getRandomInt(2) == 0) {
			command = rightButtonClick;
		} else {
			command = leftButtonClick;
		}
		command.scopeVars.player_index = gameState.inner.attrs.current_player + 1;
		gameState.applyCommand(command);

		console.log("game attrs", gameState.inner.attrs);
		console.log("outcome", gameState.inner.checkOutcome());
	}

	console.log("game attrs", gameState.inner.attrs);
}

module.exports = { test }
