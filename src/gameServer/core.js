const Master = {};

Master.loadGameServers = async function() {
    for (let gameServer of this.getAll(GameServer)) {
        gameServer.delete();
    }
    let gameServers = await this.get(Mongo, 'solcery').objects.find({ template: 'gameServers' }).toArray();
    for (let gameServer of gameServers) {
        this.create(GameServer, {
            id: gameServer.fields.gameId,
            db: gameServer.fields.database
        })
    }
}

Master.onMongoReady = function(mongo) {
    if (mongo.id !== 'solcery') return;
    this.loadGameServers();
}

module.exports = Master
