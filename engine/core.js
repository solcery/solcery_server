const Master = {};

Master.loadEngines = async function() {
    for (let engine of this.getAll(Engine)) {
        engine.delete();
    }
    this.create(Engine, { id: 'solcery', gameId: 'solcery' });
    this.create(Engine, { id: 'nfts', gameId: 'nfts' });
    let engines = await this.get(Mongo, 'solcery').objects.find({ template: 'engines' }).toArray();
    for (let engine of engines) {
        this.create(Engine, {
            id: engine.fields.gameId,
            db: engine.fields.database
        })
    }
}

Master.onMongoReady = function(mongo) {
    if (mongo.id !== 'solcery') return;
    this.loadEngines();
}


module.exports = Master
