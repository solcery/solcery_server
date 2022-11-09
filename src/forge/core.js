const Master = {};

Master.onCreate = function(data) {
	if (!data.forge) return;
	this.create(Forge, { id: 'forge' });
}

module.exports = Master;
