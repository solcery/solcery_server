const { ObjectId } = require('mongodb');

const virtualDb = {
	dbs: {
		testDb: {
			gameBuilds: [
				{
					_id: ObjectId(),
					version: 1,
					content: {}
				}
			],
			gameInfo: [
				{
					_id: ObjectId(),
					gameBuildVersion: 1
				}
			]
		}
	}
}

const clientPlayer = {
	status: {},
	matchMessages: [],
}

const mixins = [
	{
		dweller: Player,
		mixinConfig: {
			master: {
				_name: 'Test player message receiver',
				onSocketMessage: function(type, data) {
					if (type === 'playerStatus') {
						clientPlayer.status = data;
					}
					if (type === 'matchAction') {
						clientPlayer.matchMessages.push(data)
					}
					if (type === 'matchStart') {
						clientPlayer.matchMessages.push(data)
					}
				}
			}
		}
	}
]

async function test(testEnv) {
	let core = createCore({ virtualDb });

	const SERVER_NAME = 'testmatchSrv';
	const PUBKEY = 'pubkey';

	await core.create(Project, { 
		id: SERVER_NAME, 
		pvpServer: true,
		db: 'testDb', 
	});
	await sleep(1)
	let pvpServer = core.get(Project, SERVER_NAME);

	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY)
	let player = pvpServer.get(Player, PUBKEY);
	assert(clientPlayer.status.code === 'online');
	let match = pvpServer.createMatch(1);
	match.addPlayer(player);
	// await sleep(1)

	match.start();
	assert(clientPlayer.status.code === 'ingame' && clientPlayer.status.data.matchId === match.id);
	assert(clientPlayer.matchMessages.length === 1);
	match.start();
	assert(clientPlayer.matchMessages.length === 2);
	player.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	assert(clientPlayer.matchMessages.length === 3);
	clientPlayer.matchMessages = [];

	// player reconnects on their side

	delete clientPlayer.status;
	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	assert(clientPlayer.status.code === 'ingame' && clientPlayer.status.data.matchId === match.id);
	assert(clientPlayer.matchMessages.length === 1);
	clientPlayer.matchMessages = [];

	// deleting player on server then reconnecting
	delete clientPlayer.status;
	player.delete();
	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	assert(clientPlayer.status.code === 'ingame' && clientPlayer.status.data.matchId === match.id);
	assert(clientPlayer.matchMessages.length === 1);

	// player leaves match
	player.execAllMixins('onSocketRequestLeaveMatch', { outcome: 1 });
	assert(clientPlayer.status.code === 'online')
}

module.exports = { test, mixins }
