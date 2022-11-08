const Master = {};
const { ObjectId } = require('mongodb');

Master.onCreate = function(data) {
    if (!data.pvpServer) {
        this.disableMixinCallbacks(Master);
        return;
    }
    this.gameBuilds = {};
    this.pvpServer = data.pvpServer;
    this.mainDb = this.core.createMongo(data.db, [ 'gameInfo', 'matches', 'gameBuilds' ]);
    this.mainDb.gameInfo.findOne({}).then(gameInfo => this.execAllMixins('onGameInfoLoaded', gameInfo));
}

Master.onGameInfoLoaded = function(gameInfo) {
    assert(gameInfo, 'Server has no game info!');
    this.gameInfo = gameInfo;
    let gameBuildVersion = gameInfo.gameBuildVersion;
    if (!gameBuildVersion) return;
    this.loadGameBuild(gameBuildVersion);
}

Master.getGameBuild = function(version) {
    return this.gameBuilds[version];
}

Master.loadGameBuild = async function(version) {
    assert(version)
    if (this.gameBuilds[version]) return;
    let build = await this.mainDb.gameBuilds.findOne({ version });
    assert(build, `No game build with version ${version} found`);
    this.gameBuilds[version] = build;
    this.execAllMixins('onGameBuildLoaded', build);
}

module.exports = Master
