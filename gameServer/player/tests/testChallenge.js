const Client = require('socket.io-client');

const createClientSocket = () => {
	const port = process.env.PORT || 5000;
	let messages = []
	let socket = Client(`ws://localhost:${port}`);
	socket.on('message', (message) => {
		messages.push(message.data);
	});
	let emit = (...args) => {
		return new Promise(resolve => {
			socket.emit(...args, (response => {
				resolve(response)
			}))
		})
	}
	let disconnect = () => socket.disconnect();
	return new Promise(resolve => {
		socket.on('connect', () => {
			resolve({ 
				socket,
				messages, 
				emit,
				disconnect
			})
		});
	})
}

async function test() {

	const core = await createCore();
	const SERVER_NAME = 'game_test';
	const PLAYER_PUBKEY = 'stuff';
	const TIMEOUT = 10;

	core.webSocketTimeout = TIMEOUT;
	core.create(GameServer, { id: SERVER_NAME, gameId: SERVER_NAME, virtualDb: {} });
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
	let client1 = await createClientSocket();

	let wsConnection = core.getAll(WSConnection)[0];
	assert(wsConnection);

	await client1.emit('message', challenge);
	assert(!client1.socket.disconnected && client1.socket.connected);
	assert(gameServer.get(Player, PLAYER_PUBKEY))

	let client2 = await createClientSocket();
	await sleep(TIMEOUT + 10)
	assert(client2.socket.disconnected);

	let client3 = await createClientSocket();
	challenge.data.server = SERVER_NAME + '!';
	client3.emit('message', challenge);
	await sleep(TIMEOUT + 10)
	assert(client3.socket.disconnected);
}

module.exports = { test }
