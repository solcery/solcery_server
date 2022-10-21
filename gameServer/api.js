const Master = {}

Master.gameServer = function(params) {
      let gameServer = this.core.get(GameServer, gameId);
      assert(gameServer, `API Error: No game with id '${gameId}'`);
      return gameServer;

}

Master['game.getGameInfo'] = async function(params) {
    let gameServer = this.gameServer(params);
    // let res =  await this.get(Mongo, 'main').gameInfo.findOne({});
    return await gameServer.get(Mongo, 'main').gameInfo.findOne({});
}

// API
Master['game.getGameVersion'] = async function (params) {
    let gameServer = this.gameServer(params);
    let version = params.version;
    if (!version) {
        version = await gameServer.get(Mongo, 'main').versions.count();
//      version = await this.mongo.versions.find().sort({ contentVersion :-1 }).limit(1)
    }
    let gameVersion = await gameServer.get(Mongo, 'main').versions.findOne({ version });
    let unityBuildId = objget(gameVersion, 'content', 'meta', 'gameSettings', 'build');
    let unityBuild = await gameServer.core.getUnityBuild(unityBuildId);
    return {
        version: gameVersion.version,
        content: gameVersion.content,
        unityBuild,
    };
}

module.exports = Master;
