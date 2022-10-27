const Master = {};

Master.onCreate = function(data) {
    // system engines
    this.create(Engine, { id: 'solcery', gameId: 'solcery' });
    this.create(Engine, { id: 'nfts', gameId: 'nfts' });

    // TODO: load from config
    this.create(Engine, { id: 'polygon', gameId: 'polygon' });
    this.create(Engine, { id: 'lightmor', gameId: 'lightmor' });
    this.create(Engine, { id: 'summoner', gameId: 'summoner' });
}

module.exports = Master
