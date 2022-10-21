const commands = {};

commands.login = {
	params: {
		login: {
			required: true,
		},
		password: {
			required: true,
		},
	},
};

commands.getById = {
	params: {
		id: {
			required: true,
		},
	},
};

commands.getSession = {
	params: {
		session: {
			required: true,
		},
	},
};

commands.create = {
	private: true,
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
