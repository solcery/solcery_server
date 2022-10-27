const Master = {};

Master.onCreate = function(data) {
    this.gameId = data.gameId;
    this.create(Mongo, {
        id: 'main',
        virtualDb: data.virtualDb,
        db: data.db,
        collections: [
            'games',
            'versions',
            'gameInfo'
        ]
    });
}

module.exports = Master
