const { Collection } = require("mongodb");

const playerMessages = {}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const GAME_NAME = 'game_lightmor'
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
	console.log(content);

	let rightButtonClick = {
		commandId: 9, 
		scopeVars: { object_id: 1 }
	}
	let leftButtonClick = {
		commandId: 9, 
		scopeVars: { object_id: 4 }
	}
    let commands = [rightButtonClick, leftButtonClick];

	let possibleCommands = function(gameState, player_index) {
		let currentPlayer = gameState.inner.attrs.current_player + 1;
		if (currentPlayer === player_index) {
			return commands;
		} else {
			return [];
		}
	}

	let botPlayerOne = await gameServer.create(Player, { 
		id: PUBKEY1, 
		// pubkey: PUBKEY1 
        bot: true,
        algorithm: 'random',
		possibleCommands: possibleCommands,
	});
	let botPlayerTwo = await gameServer.create(Player, { 
		id: PUBKEY2, 
        bot: true,
        algorithm: 'random',
		possibleCommands: possibleCommands,
	});

	let game = await gameServer.createGame();
	let gameState = game.create(GameState, {content: content, seed: 0 });
    game.gameState = gameState;


	await game.addPlayer(botPlayerOne);
	await game.addPlayer(botPlayerTwo);
	await game.start();
	console.log(gameState.inner.objects);

    // console.log(game.actionLog);
    let outcome = gameState.checkOutcome();
	assert(outcome !== undefined);
	assert(outcome !== 0);

	console.log(gameState.inner.attrs);
    if (outcome === 1) {
        console.log("player 1 win");
    } else {
        console.log("player 2 win");
    }
}

module.exports = { test }