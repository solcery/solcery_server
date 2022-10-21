const commands = {}

commands.getAllObjects = {
	params: {
		template: {
			required: true,
		},
	},
};

commands.getSchema = {
	params: {
		template: {
			required: true,
		},
	},
};

commands.setSchema = {
	log: true,
	private: true,
	params: {
		template: {
			required: true,
		},
		schema: { 
			required: true,
		},
	},
};

commands.getObjectById = {
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
	},
};

commands.updateObjectById = {
	log: true,
	private: true,
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
		fields: {
			required: true,
		},
	},
};

commands.updateObjects = {
	log: true,
	private: true,
	params: {
		objects: {
			required: true,
		},
	},
};

commands.createObject = {
	log: true,
	private: true,
	params: {
		template: {
			required: true,
		},
	},
};

commands.cloneObject = {
	log: true,
	private: true,
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
	},
};

commands.removeObjectById = {
	log: true,
	private: true,
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
	},
};

module.exports = commands;
