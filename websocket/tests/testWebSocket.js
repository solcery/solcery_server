const Client = require('socket.io-client');

// const { Server } = require('socket.io');

const createClientSocket = () => {
	const port = process.env.PORT || 5000;
	let messages = [];
	let errors = [];
	let socket = Client(`ws://localhost:${port}`);
	socket.on('message', (message) => {
		messages.push(message.data);
	});
	socket.on('exception', (error) => {
		errors.push(error);
	});
	let emit = (...args) => {
		return new Promise(resolve => {
			socket.timeout(500).emit(...args, (response => {
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
				errors,
				emit,
				disconnect
			})
		});
	})
}

const mixins = [
	{
		dweller: WSConnection,
		mixin: {
			_name: 'Test socket responder',
			onSocketMessage: function(message) {
				if (message.type !== 'testHello') return;
				this.webSocket.emit('message', {
					type: 'response',
					data: message.data + '!',
				});
			}
		}
	}
]

async function test() {

	const SOCKET_PING = 10

	const core = createCore();

	let client1 = await createClientSocket();
	assert(client1);
	assert(core.getAll(WSConnection).length === 1);

	let client2 = await createClientSocket();
	assert(client2);
	assert(core.getAll(WSConnection).length === 2);

	await client1.emit('message', {
		type: 'testHello',
		data: 'Hey',
	});
	await client2.emit('message', {
		type: 'testHello',
		data: 'Hello',
	});

	assert(client1.messages.length === 1);
	assert(client2.messages.length === 1);
	assert(client1.messages[0] === 'Hey!');
	assert(client2.messages[0] === 'Hello!')

	client1.disconnect();
	await sleep(SOCKET_PING);
	assert(core.getAll(WSConnection).length === 1);

	client2.disconnect();
	await sleep(SOCKET_PING);
	assert(core.getAll(WSConnection).length === 0);
}

module.exports = { test, mixins }
