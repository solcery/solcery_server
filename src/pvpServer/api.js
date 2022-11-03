const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.pvpServer = function(params) {
      let pvpServer = this.core.get(PvpServer, params.gameId);
      assert(pvpServer, `API Error: No game with id '${params.gameId}'`);
      return pvpServer;
}

Master.api['game.getGameInfo'] = async function(params) {
    let pvpServer = this.pvpServer(params);
    return await pvpServer.get(Mongo, 'main').gameInfo.findOne({});
}

Master.api['game.getGameVersion'] = async function (params) {
    let pvpServer = this.pvpServer(params);
    return await pvpServer.getGameVersion(params.version);; 
}

Master.api['core.reloadPvpServers'] = async function(params) {
      await this.core.loadPvpServers();
      return 'Game servers reloaded, current number of servers: ' + this.core.getAll(PvpServer).length;
}


module.exports = Master;
