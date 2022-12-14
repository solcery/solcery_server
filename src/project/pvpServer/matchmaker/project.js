const Master = {}

Master.onCreate = function(data) {
	if (!data.pvpServer) {
        this.disableMixinCallbacks(Master);
        return;
    }
}

Master.onGameBuildLoaded = function(gameBuild) {
	if (gameBuild.version !== this.gameInfo.gameBuildVersion) return;
	let matchmakerContent = objget(gameBuild, 'content', 'matchmaker');
	if (!matchmakerContent) return;
	this.matchmaker = this.create(Matchmaker, {
		id: `matchmaker.${this.id}`,
		matchmakerContent,
		version: gameBuild.version,
	})
}

Master.onDelete = function() {
	if (!this.matchmaker) return;
	this.matchmaker.delete();
}

module.exports = Master
