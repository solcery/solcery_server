const Master = {};
const { ObjectId } = require('mongodb');

Master.onCreate = function(data) {
    if (!data.pvpServer) {
        this.disableMixinCallbacks(Master);
        return;
    }
    this.gameBuilds = {};
    this.pvpServer = data.pvpServer;
    this.gameDb = this.core.createMongo(data.db, [ 'gameInfo', 'matches', 'gameBuilds' ]);
    this.gameDb.gameInfo.findOne({}).then(gameInfo => this.execAllMixins('onGameInfoLoaded', gameInfo));
}

Master.onGameInfoLoaded = function(gameInfo) {
    if (!gameInfo) {
        env.error(`Project ${this.id} has no gameInfo, pvp server won't start`);
        this.disableMixinCallbacks(Master)
        return;
    }
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
    if (typeof version === 'string') { // Somehow string is stored in game data
        version = parseInt(version);
    }
    if (this.gameBuilds[version]) return;
    let build = await this.gameDb.gameBuilds.findOne({ version });
    assert(build, `No game build with version ${version} found`);
    let firstLoading = !this.gameBuilds[version];
    this.gameBuilds[version] = build;
    if (firstLoading) {
        this.execAllMixins('onGameBuildLoaded', build);
    }
}

module.exports = Master
