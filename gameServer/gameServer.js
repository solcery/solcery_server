const Master = {};

Master.onCreate = async function(data) {
    this.gameId = data.gameId;
    this.mongo = await this.create(Mongo, {
        id: 'main',
        virtualDb: data.virtualDb,
        db: this.gameId,
        collections: [
            'games',
            'versions',
            'gameInfo'
        ]
    })
    await this.execAllMixins('onStart');
}

Master.getGameInfo = async function() {
    assert(this.mongo);
    return await this.mongo.gameInfo.findOne({});
}

// Master.getGameVersion = async function(contentVersion) { 
//     let version;
//     if (contentVersion) {
//         version = await this.mongo.versions.find({ contentVersion })
//     } else {
//         version = await this.mongo.versions.find().sort({ contentVersion :-1 }).limit(1)
//     }
//     return version;
// }

Master.onApiCommandGetGameInfo = async function(data) {
    data.result = await this.mongo.gameInfo.findOne({});
}

Master.onApiCommandGetGameVersion = async function (data) {
    let version = data.params.version;
    if (!version) {
        version = await this.mongo.versions.count();
    }
    let gameVersion = await this.mongo.versions.findOne({ version });
    let unityBuildId = objget(gameVersion, 'content', 'meta', 'gameSettings', 'build');
    let unityBuild = await this.core.getUnityBuild(unityBuildId);
    data.result = {
        version: gameVersion.version,
        content: gameVersion.content,
        unityBuild,
    };
}

module.exports = Master
