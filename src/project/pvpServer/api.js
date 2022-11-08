const { ObjectId } = require('mongodb');
const Master = { api: { game: {} } };

Master.api.game.ctx = function(params, ctx) {
    ctx.game = this.core.get(Project, params.gameId);
    assert(ctx.game, `API Error: No game with id '${params.gameId}'`);
}

Master.api.game.getGameInfo = async function(params, ctx) {
    return ctx.game.gameInfo;
}

Master.api.game.getGameBuild = async function(params, ctx) {
     let res = ctx.game.gameBuilds[params.version];
     assert(res, `No game build with version ${params.version} found`)
     return res;
}

module.exports = Master;
