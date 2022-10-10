const Master = {};

Master.onCreate = function(data) {
    console.log('GameServer core onCreate')
    this.create(GameServer, { id: 'game_polygon', gameId: 'game_polygon' });
}

module.exports = Master
