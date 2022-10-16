const WebSocket = require('ws')

async function connectToServer() {
    let connected = false;
	var ws = new WebSocket('ws://localhost:7000/ws');
    return new Promise((resolve, reject) => {
    	setTimeout(function() {
    		if (!connected) reject('Socket timeout: Failed to handshake');
    	}, 3000);
    	ws.onopen = () => {
    		connected = true;
    		resolve(ws);
    	}
    });
}

async function test() {

	const core = await createCore();
	const SERVER_NAME = 'game_test';
	const PLAYER_PUBKEY = 'stuff';
	const TIMEOUT = 10;

	assert(core.webSocketServer);
	core.webSocketTimeout = TIMEOUT;
	await core.create(GameServer, { id: SERVER_NAME, gameId: SERVER_NAME, virtualDb: {} });
	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer)

	let challenge = {
		type: 'challenge',
		data: {
			server: SERVER_NAME,
			pubkey: PLAYER_PUBKEY
		}
	}

	// Client 1 sends the challenge
	let clientWs1 = await connectToServer();

	let wsConnection = core.getAll(WSConnection)[0];
	assert(wsConnection);

	clientWs1.send(JSON.stringify(challenge))
	await sleep(TIMEOUT + 10)
	assert(clientWs1.readyState === 1);
	assert(gameServer.get(Player, PLAYER_PUBKEY))

	let clientWs2 = await connectToServer();
	await sleep(TIMEOUT + 10)

	assert(clientWs2.readyState !== 1);

	let clientWs3 = await connectToServer();
	challenge.data.server = SERVER_NAME + '!';
	clientWs3.send(JSON.stringify(challenge))
	await sleep(TIMEOUT + 10)
	assert(clientWs3.readyState !== 1);
}

module.exports = { test }
