const Master = {};

Master.onCreate = function(data) {
    this.mongoDbProvider = this.create(Mongo, { 
        id: 'mongo.main',
        virtual: data.virtualDb,
    })
}

Master.mongoRequest = function(dbName, collection, func, params) {
    let mongo = this.mongoDbProvider;
    assert(mongo, 'No mongoDb provider!');
    return mongo.client.db(dbName).collection(collection)[func](params);
}

Master.createMongo = function(dbName, collections) {
    let mongo = this.mongoDbProvider;
    assert(dbName)
    const db = mongo.client.db(dbName);
    assert(collections)
    let res = {};
    for (let collectionName of collections) {
        res[collectionName] = db.collection(collectionName)
    }
    return res;
}

module.exports = Master
