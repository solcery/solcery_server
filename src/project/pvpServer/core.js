const Master = {};

Master.loadProjects = async function() {
    // for (let pvpServer of this.getAll(Project)) {
    //     pvpServer.delete();
    // }
    // let pvpServers = await this.get(Mongo, 'solcery').objects.find({ template: 'pvpServers' }).toArray();
    // for (let pvpServer of pvpServers) {
    //     this.create(Project, {
    //         id: pvpServer.fields.gameId,
    //         db: pvpServer.fields.database
    //     })
    // }
}

Master.onMongoReady = function(mongo) {
    if (mongo.id !== 'solcery') return;
    this.loadProjects();
}

module.exports = Master
