
async function test(testEnv) {
	const core = createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';
	const PUBKEY3 = 'pubkey3';

	core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		db: { 
			gameInfo: [
				{
					matchmakerSettings: {
						playerQuantity: 2,
						botFillTimeout: 50,
						tickPeriod: 10,
					},
				}
			],
			versions: [
				{
					version: 1,
					content: {
						matchmaker: {
							players: [
								{
									id: 1,
								},
								{
									id: 2,
								},
							],
							matchmaker: {
								botFillTimeout: 40,
							}
						}
					}
				}
			]
		}
	});
	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer);
	await sleep(1);
	let matchmaker = gameServer.matchmaker;
	assert(matchmaker)

	gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY1);
	gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY2);
	gameServer.execAllMixins('onPlayerSocketConnected', PUBKEY3);

	let player1 = gameServer.get(Player, PUBKEY1);
	let player2 = gameServer.get(Player, PUBKEY2);
	let player3 = gameServer.get(Player, PUBKEY3);
	assert(player1 && player2 && player3);

	assert(gameServer.getAll(Game).length === 0)

	player1.execAllMixins('onSocketRequestJoinQueue');
	assert(matchmaker.queue.length === 1);

	player2.execAllMixins('onSocketRequestJoinQueue');
	let game = gameServer.getAll(Game)[0];
	assert(game);
	assert(game.players.length === 2 && game.players[0].id === PUBKEY1 && game.players[1].id === PUBKEY2);
	game.delete();

	assert(gameServer.getAll(Game).length === 0);
	player3.execAllMixins('onSocketRequestJoinQueue');

	env.skip(10);
	core.tick();

	assert(matchmaker.queue.length === 1);


	env.skip(50)
	core.tick();

	assert(matchmaker.queue.length === 0);
	game = gameServer.getAll(Game)[0];
	assert(game);
	assert(game.players.length === 2);
	let botId = game.players[1].id;
	let bot = gameServer.get(Player, botId)
	assert(bot);

}

module.exports = { test }
