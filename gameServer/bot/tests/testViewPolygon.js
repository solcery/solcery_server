const { Collection } = require("mongodb");

const playerMessages = {}

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	// const GAME_NAME = 'game_lightmor'
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
		console.log("retry getting game from mongo db");
		await sleep(1000);
		mongo = await gameServer.get(Mongo, 'main');
	} 
	assert(mongo.versions, "failed to get a game from mongo db")
	console.log(Object.keys(mongo));

    let version = await mongo.versions.count();
	// console.log(mongo.versions);
    console.log("version", version);

	let gameVersion = await mongo.versions.findOne({ version });
	console.log("gameVersion", gameVersion);
	console.log("content\n", gameVersion.content.web);

	console.log("game settings\n", gameVersion.content.web.gameSettings);
}

module.exports = { test }
