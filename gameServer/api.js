const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.gameServer = function(params) {
      let gameServer = this.core.get(GameServer, params.gameId);
      assert(gameServer, `API Error: No game with id '${params.gameId}'`);
      return gameServer;
}

Master.api['game.getGameInfo'] = async function(params) {
    let gameServer = this.gameServer(params);
    // let res =  await this.get(Mongo, 'main').gameInfo.findOne({});
    return await gameServer.get(Mongo, 'main').gameInfo.findOne({});
}

// API
Master.api['game.getGameVersion'] = async function (params) {
    let gameServer = this.gameServer(params);
    let version = params.version;
    if (!version) {
        version = await gameServer.get(Mongo, 'main').versions.count();
//      version = await this.mongo.versions.find().sort({ contentVersion :-1 }).limit(1)
    }
    let gameVersion = await gameServer.get(Mongo, 'main').versions.findOne({ version });
    let unityBuildId = objget(gameVersion, 'content', 'meta', 'gameSettings', 'build');
    let solceryMongo = this.core.get(Mongo, 'solcery');
    assert(solceryMongo);
    let unityBuild = await solceryMongo.objects.findOne({ _id: ObjectId(unityBuildId) });
    return {
        version: gameVersion.version,
        content: gameVersion.content,
        unityBuild: unityBuild.fields,
    };
}

module.exports = Master;
