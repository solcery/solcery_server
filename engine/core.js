const Master = {};

Master.onCreate = function(data) {
    this.create(Engine, { id: 'polygon', gameId: 'polygon' });
    this.create(Engine, { id: 'summoner', gameId: 'summoner' });
}

module.exports = Master
