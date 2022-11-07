const Master = {}

Master.onCreate = function(data) {
	assert(data.db)
	this.db = data.db;
}

module.exports = Master;
