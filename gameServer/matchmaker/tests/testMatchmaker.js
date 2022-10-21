const mixins = [
	// {
	// 	dweller: Player,
	// 	mixin: {
	// 		_name: 'Test player message receiver',
	// 		onGameUpdate: function(data) {
	// 			objinsert(playerMessages, JSON.parse(JSON.stringify(data)), this.id)
	// 		}
	// 	}
	// }
]

async function test() {
	const core = createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';
	const PUBKEY3 = 'pubkey3';

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
	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer);
	await sleep(1);
	let matchmaker = gameServer.matchmaker;
	assert(matchmaker)

	gameServer.execAllMixins('onPlayerWSConnected', PUBKEY1);
	gameServer.execAllMixins('onPlayerWSConnected', PUBKEY2);
	gameServer.execAllMixins('onPlayerWSConnected', PUBKEY3);

	let player1 = gameServer.get(Player, PUBKEY1);
	let player2 = gameServer.get(Player, PUBKEY2);
	let player3 = gameServer.get(Player, PUBKEY3);
	assert(player1 && player2 && player3);

	assert(gameServer.getAll(Game).length === 0)

	player1.execAllMixins('onWSRequestJoinQueue');
	assert(matchmaker.queue.length === 1);

	player2.execAllMixins('onWSRequestJoinQueue');
	let game = gameServer.getAll(Game)[0];
	assert(game);
	assert(game.players.length === 2 && game.players[0].id === PUBKEY1 && game.players[1].id === PUBKEY2);
	game.delete();

	assert(gameServer.getAll(Game).length === 0);
	player3.execAllMixins('onWSRequestJoinQueue');
	await sleep(10);
	assert(matchmaker.queue.length === 1);
	await sleep(50);
	assert(matchmaker.queue.length === 0);
	game = gameServer.getAll(Game)[0];
	assert(game);
	assert(game.players.length === 2);
	let botId = game.players[1].id;
	let bot = gameServer.get(Player, botId)
	assert(bot);

}

module.exports = { test }
