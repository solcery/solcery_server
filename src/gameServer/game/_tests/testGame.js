const playerMessages = {}

const mixins = [
	{
		dweller: Player,
		mixinConfig: {
			master: {
				_name: 'Test player message receiver',
				onGameAction: function(data) {
					objinsert(playerMessages, JSON.parse(JSON.stringify(data)), this.id)
				},
				onGameStart: function(data) {
					objinsert(playerMessages, JSON.parse(JSON.stringify(data)), this.id)
				}
			}
		}
	}
]

async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const PUBKEY1 = 'pubkey1';
	const PUBKEY2 = 'pubkey2';

	await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: SERVER_NAME, 
		db: {}, 
	});
	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer);
	let player1 = gameServer.create(Player, { id: PUBKEY1, pubkey: PUBKEY1 });
	let player2 = gameServer.create(Player, { id: PUBKEY2, pubkey: PUBKEY2 });
	let game = await gameServer.createGame();

	await game.addPlayer(player1);
	await game.addPlayer(player2);
	await game.start();

	await player1.execAllMixins('onSocketRequestAction', { type: 'rightClick' });
	await player2.execAllMixins('onSocketRequestAction', { type: 'leftClick' });
	await player2.execAllMixins('onSocketRequestAction', { type: 'rightClick' });

	await player1.execAllMixins('onSocketRequestLeaveGame', { outcome: 1 });
	assert(gameServer.get(Game, game.id));
	await player2.execAllMixins('onSocketRequestLeaveGame', { outcome: -1 });
	assert(!gameServer.get(Game, game.id));

	assert(game.actionLog[5].player === 2 && game.actionLog[5].action.outcome === -1);
	assert(playerMessages[PUBKEY1] && playerMessages[PUBKEY1].length === 4);
	assert(playerMessages[PUBKEY2] && playerMessages[PUBKEY2].length === 5);
}

module.exports = { test, mixins }
