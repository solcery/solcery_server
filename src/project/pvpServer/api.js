const { ObjectId } = require('mongodb');
const Master = { api: { game: {} } }

Master.api.game.ctx = function(params) {
      let pvpServer = this.core.get(Project, params.gameId);
      assert(pvpServer, `API Error: No game with id '${params.gameId}'`);
      return pvpServer;
}

Master.api.game.getGameInfo = async function(params) {
    let pvpServer = this.pvpServer(params);
    return await pvpServer.get(Mongo, 'main').gameInfo.findOne({});
}

Master.api.game.getGameVersion = async function (params) {
    let pvpServer = this.pvpServer(params);
    return await pvpServer.getGameVersion(params.version);; 
}

Master.api.game.reloadServer = async function(params) {
    // TODO:
}


module.exports = Master;
