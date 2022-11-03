const Master = {};
const { ObjectId } = require('mongodb');

Master.onCreate = function(data) {
    this.gameId = data.gameId;
    this.gameVersions = {};
    this.create(Mongo, {
        id: 'main',
        db: data.db,
        collections: [
            'games',
            'versions',
            'gameInfo'
        ]
    });
}

Master.onMongoReady = function(mongo) {
    if (mongo.id !== 'main') return;
    this.getGameVersion(); 
}

Master.getGameVersion = async function(version) {
    let mongo = this.get(Mongo, 'main');
    version = version ?? this.latestVersion;
    if (!version) {
        version = await mongo.versions.count();
        var latest = true;
    }
    if (!this.gameVersions[version]) {
        let ver = await mongo.versions.findOne({ version });
        if (!ver) return;
        this.gameVersions[version] = ver;
        if (latest) {
            this.latestVersion = ver;
            this.execAllMixins('onGameVersionLoaded', ver);
        }
    }
    return this.gameVersions[version]
}

module.exports = Master
