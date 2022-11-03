const Master = {};

Master.loadPvpServers = async function() {
    for (let pvpServer of this.getAll(PvpServer)) {
        pvpServer.delete();
    }
    let pvpServers = await this.get(Mongo, 'solcery').objects.find({ template: 'pvpServers' }).toArray();
    for (let pvpServer of pvpServers) {
        this.create(PvpServer, {
            id: pvpServer.fields.gameId,
            db: pvpServer.fields.database
        })
    }
}

Master.onMongoReady = function(mongo) {
    if (mongo.id !== 'solcery') return;
    this.loadPvpServers();
}

module.exports = Master
