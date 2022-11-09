const Master = {}

Master.onCreate = function(data) {
	assert(data.db, 'No db provided for project')
}

module.exports = Master;
