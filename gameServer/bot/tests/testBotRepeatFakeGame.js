const { Collection } = require("mongodb");

const playerMessages = {}

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY1 = 'realPlayer';
	const PUBKEY2 = 'botPlayer';

	core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		matchmaker: {
			playerQuantity: 2,
			botFillTimeout: 50,
			tickPeriod: 10,
		},
		db: { 
			gameInfo: [
				{
					playerQuantity: 2,
					botFillTimeout: 50,
					tickPeriod: 10,
				}
			]
		}
	});

	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer);

	let player = await gameServer.create(Player, { 
		id: PUBKEY1, 
		pubkey: PUBKEY1 
	});
	let bot = await gameServer.create(Player, { 
		id: PUBKEY2, 
		bot: true, 
		algorithm: 'repeatLastAction' 
	});

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