const Master = {}

Master.onCreate = function(data) {
	assert(data.database)
	this.database = data.database;
}

module.exports = Master;
