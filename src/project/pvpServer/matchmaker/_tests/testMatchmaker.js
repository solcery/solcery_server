const virtualDb = {
	dbs: {
		testDb: { 
			gameInfo: [
				{
					gameBuildVersion: 1,
				}
			],
			gameBuilds: [
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
	}
}

async function test(testEnv) {
	const core = createCore({ virtualDb });

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';
	const PUBKEY3 = 'pubkey3';

	core.create(Project, { 
		id: SERVER_NAME, 
		pvpServer: true,
		db: 'testDb',
	});
	let pvpServer = core.get(Project, SERVER_NAME);
	assert(pvpServer);
	await sleep(1);
	let matchmaker = pvpServer.matchmaker;
	assert(matchmaker)

	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY1);
	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY2);
	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY3);

	let player1 = pvpServer.get(Player, PUBKEY1);
	let player2 = pvpServer.get(Player, PUBKEY2);
	let player3 = pvpServer.get(Player, PUBKEY3);
	assert(player1 && player2 && player3);

	assert(pvpServer.getAll(Match).length === 0)

	player1.execAllMixins('onSocketRequestJoinQueue');
	assert(matchmaker.queue.length === 1);

	player2.execAllMixins('onSocketRequestJoinQueue');
	let match = pvpServer.getAll(Match)[0];
	assert(match);
	assert(match.players.length === 2 && match.players[0].id === PUBKEY1 && match.players[1].id === PUBKEY2);
	match.delete();

	assert(pvpServer.getAll(Match).length === 0);
	player3.execAllMixins('onSocketRequestJoinQueue');

	env.skip(10);
	core.tick();

	assert(matchmaker.queue.length === 1);

	env.skip(50)
	core.tick();

	assert(matchmaker.queue.length === 0);
	match = pvpServer.getAll(Match)[0];
	assert(match);
	assert(match.players.length === 2);
	let botId = match.players[1].id;
	let bot = pvpServer.get(Player, botId)
	assert(bot);

}

module.exports = { test }
