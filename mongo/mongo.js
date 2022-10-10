const { MongoClient } = require("mongodb");
const databaseUri = process.env.ATLAS_URI;
const Master = {};

Master.onCreate = function(data) {
    const client = new MongoClient(databaseUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    client.connect((err, connection) => {
        assert(connection, 'NO DB')
        this.connection = connection;
        this.db = client.db(data.db);
        if (!data.collections) return;
        for (let collection of data.collections) {
            this[collection] = this.db.collection(collection)
        }
        this.parent.execAllMixins('onMongoConnected', { mongo: this });
    });
}

module.exports = Master
