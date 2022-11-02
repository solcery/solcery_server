const { Collection } = require("mongodb");

const playerMessages = {}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const GAME_NAME = 'game_lightmor'
	const PUBKEY1 = 'realPlayer';
	const PUBKEY2 = 'botPlayer';

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

	let realPlayer = await gameServer.create(Player, { 
		id: PUBKEY1, 
		pubkey: PUBKEY1 
	});
	let botPlayer = await gameServer.create(Player, { 
		id: PUBKEY2, 
        bot: true,
        algorithm: 'repeatLastAction',
	});

	let content = gameVersion.content.web;
	console.log(content);

	let game = await gameServer.createGame();
	let gameState = game.create(GameState, {content: content, seed: 0 });
    game.gameState = gameState;

	let rightButtonClick = {
		commandId: 9, 
		scopeVars: { object_id: 1 }
	}
	let leftButtonClick = {
		commandId: 9, 
		scopeVars: { object_id: 4 }
	}
    let commands = [rightButtonClick, leftButtonClick];

	await game.addPlayer(realPlayer);
	await game.addPlayer(botPlayer);
	await game.start();

	while(!gameState.inner.checkOutcome()) {
        let command = commands[getRandomInt(2)];

	    realPlayer.execAllMixins('onWSRequestAction', { 
            action: command 
        });

		console.log("game attrs", gameState.inner.attrs);
		// console.log("outcome", gameState.checkOutcome());
	}
	// console.log(gameState.inner.attrs);
    console.log(game.actionLog);
    let outcome = gameState.checkOutcome();
    if (outcome === 1) {
        console.log("real player win");
    } else {
        console.log("bot win");
    }

	assert(gameState);
}

module.exports = { test }