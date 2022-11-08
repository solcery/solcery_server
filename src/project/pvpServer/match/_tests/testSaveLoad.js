const { ObjectId } = require('mongodb');

const db = {
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

async function test(testEnv) {
	let core = createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY = 'pubkey';

	let pvpServer = core.create(Project, { 
		id: SERVER_NAME, 
		pvpServer: true,
		db, 
	});
	await sleep(1);

	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	let match = pvpServer.createMatch(1);
	let matchId = match.id;
	let player1 = pvpServer.get(Player, PUBKEY);
	match.addPlayer(player1);
	match.start();
	let started = match.started;
	player1.execAllMixins('onSocketRequestAction', { type: 'rightClick' });
	pvpServer.delete();

	core.delete();

	core = createCore();
	pvpServer = core.create(Project, { 
		id: SERVER_NAME,
		pvpServer: true,
		db, 
	});
	await sleep(1)

 	pvpServer.execAllMixins('onPlayerSocketConnected', PUBKEY);
	player1 = pvpServer.get(Player, PUBKEY);
	player1.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	match = pvpServer.get(Match, matchId)
	assert(player1);
	assert(match);
	assert(match.actionLog.length = 2);
	assert(match.actionLog[1].ctx.player_index === 1);
	assert(match.id === matchId);
	assert(match.started === started);
}

module.exports = { test }
