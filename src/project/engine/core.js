const Master = {};

Master.loadEngines = async function() {
    // for (let engine of this.getAll(Engine)) {
    //     engine.delete();
    // }
    // this.create(Engine, { id: 'solcery', db: 'solcery' });
    // this.create(Engine, { id: 'nfts', db: 'nfts' });
    // let engines = await this.get(Mongo, 'solcery').objects.find({ template: 'engines' }).toArray();
    // for (let engine of engines) {
    //     this.create(Engine, {
    //         id: engine.fields.gameId,
    //         db: engine.fields.database
    //     })
    // }
}

Master.onMongoReady = function(mongo) {
    if (mongo.id !== 'solcery') return;
}


module.exports = Master
