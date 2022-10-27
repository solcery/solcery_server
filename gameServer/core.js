const Master = {};

Master.onCreate = function(data) {
    this.create(GameServer, { 
        id: 'game_polygon',
        gameId: 'game_polygon',
        matchmaker: {
            playerQuantity: 1,
            botFillTimeout: 1000,
        }
    });
    // this.create(GameServer, { id: 'game_summoner', gameId: 'game_summoner' });
}

module.exports = Master
