const Master = {}

Master.game = function(params) {
      let gameId = params.gameId;
      let gameServer = this.core.get(GameServer, gameId);
      assert(gameServer, `API Error: No game with id '${gameId}'`);
      return gameServer;
}

module.exports = Master;
