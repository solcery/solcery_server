const Master = {};

Master.onCreate = async function(data) {
    this.projectId = data.projectId;
    this.mongo = this.create(Mongo, { 
        id: 'project', 
        db: data.projectId,
        collections: [
            'objects',
            'templates',
            'config',
            'users',
            'logs'
        ]
    });
}

Master.onMongoConnected = async function(data) {
    if (data.mongo.id === 'project') {
        this.mongo = data.mongo;
        let configObj = await this.mongo.config.findOne({});
        let config = configObj.fields;
        this.config = config;
        this.execAllMixins('onProjectConfigUpdate', { config });
    }
}

module.exports = Master
