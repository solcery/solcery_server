const Master = {}

Master.onCreate = function(data) {
	if (!data.pvpServer) {
        this.disableMixinCallbacks(Master);
        return;
    }
    this.getRequiredGameBuilds();
}

Master.createMatch = function(version) {
	assert(version, 'Attempt to create match withouth specifying game build version');
	let gameBuild = this.getGameBuild(version);
	assert(gameBuild, `Game build with version ${version} isn't loaded on server`);
	return this.create(Match, {
		id: uuid(),
		version,
		gameBuild,
	});
}

Master.onGameBuildLoaded = async function(gameBuild) {
	let version = gameBuild.version;
	let matches = await this.mongo.matches.find({ finished: null, version }).toArray();
	for (let match of matches) {
		this.create(Match, match);
	}
}


Master.getRequiredGameBuilds = async function() {
	let matches = await this.mongo.matches.find({ finished: null }).toArray();
	let gameBuildVersions = {}
	for (let match of matches) {
		gameBuildVersions[match.version] = true;
	}
	for (let version of Object.keys(gameBuildVersions)) {
		this.loadGameBuild(version);
	}
}

Master.getLatestGameBuild = async function() {
    this.latestGameBuildVersion = version;
    let build = await this.getGameBuild(version);
}


module.exports = Master
