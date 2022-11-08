const Master = {}

Master.onCreate = function(data) {
	if (data.solceryDb) {
		this.systemMongo = this.create(Mongo, {
			id: 'solcery',
			db: data.solceryDb,
			collections: [
				'objects',
			],
	  	})
	}
}

module.exports = Master;
