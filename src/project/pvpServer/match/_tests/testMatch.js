const playerMessages = {}
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

const mixins = [
	{
		dweller: Player,
		mixinConfig: {
			master: {
				_name: 'Test player message receiver',
				onMatchUpdate: function(data) {
					objinsert(playerMessages, JSON.parse(JSON.stringify(data)), this.id)
				}
			}
		}
	}
]

async function test(testEnv) {
	const core = createCore({ virtualDb });

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';

	let pvpServer = core.create(Project, { 
		id: SERVER_NAME,
		pvpServer: true,
		db: 'testDb', 
	});
	await sleep(1) // Dirty hack, allowing server to load everything
	let player1 = pvpServer.create(Player, { id: PUBKEY1, pubkey: PUBKEY1 });
	let player2 = pvpServer.create(Player, { id: PUBKEY2, pubkey: PUBKEY2 });
	let match = pvpServer.createMatch({ version: 1 });

	match.addPlayer(player1);
	match.addPlayer(player2);
	match.start();

	player1.execAllMixins('onSocketRequestAction', { type: 'rightClick' });
	player2.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	player2.execAllMixins('onSocketRequestAction', { type: 'rightClick' });

	player1.execAllMixins('onSocketRequestLeaveMatch');
	assert(pvpServer.get(Match, match.id));
	player2.execAllMixins('onSocketRequestLeaveMatch');
	assert(!pvpServer.get(Match, match.id));
	assert(player1.status.code === 'online' && player2.status.code === 'online');
	assert(match.actionLog[5].player === PUBKEY2);
	assert(playerMessages[PUBKEY1] && playerMessages[PUBKEY1].length === 5);
	assert(playerMessages[PUBKEY2] && playerMessages[PUBKEY2].length === 6);

	match = pvpServer.createMatch({ version: 1 });
	match.addPlayer(player1);
	match.addPlayer(player2);
	match.delete();
	assert(player1.status.code === 'online' && player2.status.code === 'online');
}

module.exports = { test, mixins }
