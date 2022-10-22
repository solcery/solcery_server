const commands = {};

commands.getAccess = {
	params: {
		login: {
			required: true,
		},
		password: {
			required: true,
		},
	},
};

commands.get = {
	params: {
		login: {
			required: true,
		},
		password: {
			required: true,
		},
	},
};

commands.update = {
	private: true,
	params: {
		id: {
			required: true,
		},
		fields: {
			required: true,
		},
	},
};

module.exports = commands;
