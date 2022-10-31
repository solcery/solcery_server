const Master = {};

Master.onCreate = function(data) {
    this.gameId = data.gameId;
    this.gameVersions = data.gameVersions ?? {};
    this.create(Mongo, {
        id: 'main',
        db: data.db,
        collections: [
            'games',
            'versions',
            'gameInfo'
        ]
    });
}

Master.getGameVersion = async function(version) {
    let version = params.version;
    if (!version) {
        version = await gameServer.get(Mongo, 'main').versions.count();
    }
    if (!this.gameVersions[version]) {
        let gameVersion = await gameServer.get(Mongo, 'main').versions.findOne({ version });
        let unityBuildId = objget(gameVersion, 'content', 'meta', 'gameSettings', 'build');
        let solceryMongo = this.core.get(Mongo, 'solcery');
        assert(solceryMongo);
        let unityBuild = await solceryMongo.objects.findOne({ _id: ObjectId(unityBuildId) });

        this.gameVersions[versions] = {
            version: gameVersion.version,
            content: gameVersion.content,
            unityBuild: unityBuild.fields,
        };
    }
    return this.gameVersions[version]
}

module.exports = Master
