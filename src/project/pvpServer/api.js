const { ObjectId } = require('mongodb');
const Master = { api: { game: {} } };

Master.api.game.ctx = function(params, ctx) {
    ctx.project = this.core.get(Project, params.gameId);
    assert(ctx.project, `API Error: No game with id '${params.gameId}'`);
    assert(ctx.project.free, `API Error: Project '${params.gameId}' is busy`)
}

Master.api.game.getGameInfo = async function(params, ctx) {
    return ctx.project.gameInfo;
}

Master.api.game.getGameBuild = async function(params, ctx) {
     let res = ctx.project.gameBuilds[params.version];
     assert(res, `No game build with version ${params.version} found`)
     return res;
}

module.exports = Master;
