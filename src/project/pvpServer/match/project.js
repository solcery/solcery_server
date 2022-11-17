const Master = {}

Master.onCreate = function(data) {
	if (!data.pvpServer) {
        this.disableMixinCallbacks(Master);
        return;
    }
    this.getRequiredGameBuilds();
}

Master.createMatch = function(data) {
	assert(data, 'Error creating match, no data provided!');
	data.id = data.id ?? uuid();
	assert(data.version, 'Attempt to create match withouth specifying game build version');
	let gameBuild = this.getGameBuild(data.version);
	assert(gameBuild, `Game build with version ${data.version} isn't loaded on server`);
	return this.create(Match, {
		...data,
		gameBuild,
	});
}

Master.onGameBuildLoaded = async function(gameBuild) {
	let version = gameBuild.version;
	this.completeTask(`load.gameBuild.${version}`)
	let matches = await this.gameDb.matches.find({ finished: null, version }).toArray();
	for (let matchData of matches) {
		this.createMatch(matchData);
		this.completeTask(`load.match.${matchData.id}`);
	}
}

Master.getRequiredGameBuilds = async function() {
	this.addTask('load.matches');
	let matches = await this.gameDb.matches.find({ finished: null }).toArray();

	let gameBuildVersions = {};
	for (let match of matches) {
		this.addTask(`load.match.${match.id}`);
		gameBuildVersions[match.version] = true;
	}
	for (let version of Object.keys(gameBuildVersions)) {
		this.addTask(`load.gameBuild.${version}`)
		this.loadGameBuild(version);
	}
	this.completeTask('load.matches');
}

Master.getLatestGameBuild = async function() {
    this.latestGameBuildVersion = version;
    let build = await this.getGameBuild(version);
}


module.exports = Master
