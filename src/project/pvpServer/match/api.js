const Master = { api: game: {} }

Master.api.game.getGameBuild = async function (params, ctx) {
    return await ctx.project.getGameBuild(params.version);; 
}