const Master = {};

Master.onCreate = function(data) {
    this.gameId = data.gameId;
    this.create(Mongo, {
        id: 'main',
        virtualDb: data.virtualDb,
        db: this.gameId,
        collections: [
            'games',
            'versions',
            'gameInfo'
        ]
    })
}

// // API
// Master.getGameInfo = async function() {
//     // let res =  await this.get(Mongo, 'main').gameInfo.findOne({});
//     return await this.get(Mongo, 'main').gameInfo.findOne({});
// }

// // API
// Master.getGameVersion = async function (params) {
//     let version = params.version;
//     if (!version) {
//         version = await this.get(Mongo, 'main').versions.count();
// //      version = await this.mongo.versions.find().sort({ contentVersion :-1 }).limit(1)
//     }
//     let gameVersion = await this.get(Mongo, 'main').versions.findOne({ version });
//     let unityBuildId = objget(gameVersion, 'content', 'meta', 'gameSettings', 'build');
//     let unityBuild = await this.core.getUnityBuild(unityBuildId);
//     return {
//         version: gameVersion.version,
//         content: gameVersion.content,
//         unityBuild,
//     };
// }

module.exports = Master
