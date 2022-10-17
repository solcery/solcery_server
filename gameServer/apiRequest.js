const Master = {}

Master.game = function(params) {
      let gameId = params.gameId;
      let gameServer = this.core.get(GameServer, gameId);
      assert(gameServer, `API Error: No game with id '${gameId}'`);
      assert(gameServer.ready, 'API Error: server is loading');
      return gameServer;
}

module.exports = Master;
