const Client = require('socket.io-client');

const createClientApi = (api) => {
	return (data) => {
		return new Promise((resolve, reject) => {
			let response = {
				header: () => {},
				json: res => {
					let json = JSON.parse(JSON.stringify(res)); // Copy links
					if (json.status) {
						resolve(json.data);
					} else {
						reject(json.data);
					}
				}
			}
			api.apiCall(data, response);
		})
	}
}

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

module.exports = {
	createClientApi,
	createClientSocket,
}