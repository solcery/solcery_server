const Master = {}

Master.createBot = function(data = {}) {
	data.id = data.id ?? uuid();
	return this.create(Player, { 
		bot: true,
		...data,
	})
}

module.exports = Master;
