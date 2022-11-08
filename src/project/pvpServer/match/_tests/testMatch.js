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
				onMatchAction: function(data) {
					objinsert(playerMessages, JSON.parse(JSON.stringify(data)), this.id)
				},
				onMatchStart: function(data) {
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
	let match = await pvpServer.createMatch(1);

	await match.addPlayer(player1);
	await match.addPlayer(player2);
	await match.start();

	await player1.execAllMixins('onSocketRequestAction', { type: 'rightClick' });
	await player2.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	await player2.execAllMixins('onSocketRequestAction', { type: 'rightClick' });

	await player1.execAllMixins('onSocketRequestLeaveMatch', { outcome: 1 });
	assert(pvpServer.get(Match, match.id));
	await player2.execAllMixins('onSocketRequestLeaveMatch', { outcome: -1 });
	assert(!pvpServer.get(Match, match.id));

	assert(match.actionLog[5].player === 2 && match.actionLog[5].action.outcome === -1);
	assert(playerMessages[PUBKEY1] && playerMessages[PUBKEY1].length === 4);
	assert(playerMessages[PUBKEY2] && playerMessages[PUBKEY2].length === 5);
}

module.exports = { test, mixins }
