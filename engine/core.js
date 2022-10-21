const Master = {};

Master.onCreate = function(data) {
    this.create(Engine, { id: 'polygon', gameId: 'polygon' });
}

module.exports = Master
