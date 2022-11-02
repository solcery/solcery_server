const VirtualMongoDB = require('./virtualMongo');
const { MongoClient } = require("mongodb");
const databaseUri = process.env.ATLAS_URI;

const Master = {};

Master.onCreate = function(data) {
    if (!data.db || !data.collections) return; // TODO
    if (typeof data.db === 'object') {
        this.db = new VirtualMongoDB(data.id, data.db);
        for (let collection of data.collections) {
            this[collection] = this.db.collection(collection);
        }
        this.parent.execAllMixins('onMongoReady', this)
        return;
    }
    const client = new MongoClient(databaseUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    client.connect((err, connection) => {
        if (!connection) reject('No database connection');
        this.db = client.db(data.db);
        for (let collection of data.collections) {
            this[collection] = this.db.collection(collection);
        }
        this.parent.execAllMixins('onMongoReady', this)
    });
}

module.exports = Master
