const VirtualMongoClient = require('./virtualMongo');
const { MongoClient } = require("mongodb");
const databaseUri = process.env.ATLAS_URI;

const Master = {};

Master.onCreate = function(data) {
    if (data.virtual) {
        assert(env.test, 'Attempt to use virtualDb in real environment')
        let src = {}
        if (typeof data.virtual === 'object') {
            src = data.virtual;
        }
        this.client = new VirtualMongoClient(src)
        return;
    }
    assert(!env.test, 'Attempt to use real mongo connection in test environment!');
    this.client = new MongoClient(databaseUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = Master
