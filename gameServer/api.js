const Master = {}

Master.onApiCommand = async function(commandPath, data) {
      if (commandPath[0] !== 'game') return;
      let command = commandPath[1];
      let gameId = data.params.gameId;
      let gameServer = this.core.get(GameServer, gameId)
      assert(gameServer, `API Error: No game with id '${gameId}'`);
      let callbackName = 'onApiCommand' + command.charAt(0).toUpperCase() + command.slice(1);
      await gameServer.execAllMixins(callbackName, data);
}

module.exports = Master;