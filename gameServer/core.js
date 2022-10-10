const Master = {};

Master.onCreate = function(data) {
    this.create(GameServer, { id: 'game_polygon', gameId: 'game_polygon' });
}

module.exports = Master
