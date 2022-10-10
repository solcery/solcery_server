const Master = {};

Master.onCreate = async function(data) {
    this.gameId = data.gameId;
    this.create(Mongo, {
        id: 'main',
        db: this.gameId,
        collections: [
            'games',
            'versions',
            'gameInfo'
        ]
    })
}

Master.onMongoConnected = function(data) {
    if (data.mongo.id === 'main') {
        this.mongo = data.mongo;
    }
}

Master.onApiCommandGetGameInfo = async function(result, params) {
    result.gameInfo = await this.mongo.gameInfo.findOne({});
}

Master.onApiCommandGetGameVersion = async function (result, params) {
    let version = params.gameVersion;
    if (!version) {
        version = await this.mongo.versions.count();
    }
    result.version = await this.mongo.versions.findOne({ version })
}

module.exports = Master
