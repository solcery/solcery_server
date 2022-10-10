const Master = {}

Master.createMatch = function() {
	this.create(Match, { id: uuid() })
}

Master.onCreate = function(data) {
	this.createMatch()
}

module.exports = Master
