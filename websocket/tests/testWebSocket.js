const WebSocket = require('ws')

const client1Messages = [];
const client2Messages = [];

const mixins = [
	{
		dweller: WSConnection,
		mixin: {
			_name: 'Test socket responder',
			onSocketMessage: function(message) {
				if (message.type !== 'testHello') return;
				this.webSocket.send(message.data + '!');
			}
		}
	}
]

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
	assert(core.webSocketServer)

	let clientWs1 = await connectToServer();
	clientWs1.onmessage = (event) => {
		client1Messages.push(event.data);
	}
	assert(clientWs1);
	assert(core.getAll(WSConnection).length === 1);

	let clientWs2 = await connectToServer();
	clientWs2.onmessage = (event) => {
		client2Messages.push(event.data);
	}
	assert(clientWs2, 'Client socket 2 creation failed');
	assert(core.getAll(WSConnection).length === 2);

	let hey = {
		type: 'testHello',
		data: 'Hey',
	}

	let hello = {
		type: 'testHello',
		data: 'Hello',
	}


	clientWs1.send(JSON.stringify(hey));
	clientWs2.send(JSON.stringify(hello));
	await sleep(10);

	assert(client1Messages.length === 1);
	assert(client2Messages.length === 1);
	assert(client1Messages[0] === 'Hey!');
	assert(client2Messages[0] === 'Hello!')

	clientWs1.close();
	await sleep(10);
	assert(core.getAll(WSConnection).length === 1);

	clientWs2.close();
	await sleep(10);
	assert(core.getAll(WSConnection).length === 0);
}

module.exports = { test, mixins }
