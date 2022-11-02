
// const { Server } = require('socket.io');

const mixins = [
	{
		dweller: WSConnection,
		mixinConfig: {
			master: {
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
	}
]

async function test(testEnv) {

	const SOCKET_PING = 10

	const core = createCore();

	let client1 = await testEnv.createClientSocket();
	assert(client1);
	assert(core.getAll(WSConnection).length === 1);

	let client2 = await testEnv.createClientSocket();
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
