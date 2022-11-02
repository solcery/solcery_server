const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.gameServer = function(params) {
      let gameServer = this.core.get(GameServer, params.gameId);
      assert(gameServer, `API Error: No game with id '${params.gameId}'`);
      return gameServer;
}

Master.api['game.getGameInfo'] = async function(params) {
    let gameServer = this.gameServer(params);
    return await gameServer.get(Mongo, 'main').gameInfo.findOne({});
}

Master.api['game.getGameVersion'] = async function (params) {
    let gameServer = this.gameServer(params);
    return await gameServer.getGameVersion(params.version);; 
}

Master.api['core.reloadGameServers'] = async function(params) {
      await this.core.loadGameServers();
      return 'Game servers reloaded, current number of servers: ' + this.core.getAll(GameServer).length;
}


module.exports = Master;
