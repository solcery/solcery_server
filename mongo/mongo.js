const { MongoClient } = require("mongodb");
const databaseUri = process.env.ATLAS_URI;
const Master = {};

class VirtualMongoDB {
    constructor (name, source) {
        if (typeof source !== 'object') {
            source = {};
        }
        this.name = name;
        this.source = source;
    }
    collection (name) {
        if (!this.source[name]) {
            this.source[name] = [];
        }
        return new VirtualCollection(name, this);
    }
}

const checkQuery = (query, doc) => {
    for (let [ field, value ] of Object.entries(query)) {
        if ((value === undefined || value === null) && (doc[field] === undefined || doc.field === null)) continue;
        if (doc[field] !== value) {
            return false;
        }
    }
    return true;
}

class VirtualCollection {
    constructor (name, db) {
        this.name = name;
        this.db = db;
    }
    insertOne(obj) {
        objinsert(this.db.source, obj, this.name);
    }
    dump() {
        return  this.db.source[this.name];
    }
    find(query) {
        let res = [];
        for (let doc of this.db.source[this.name]) {
            if (checkQuery(query, doc)) {
                res.push(doc)
            }
        }
        return {
            toArray: () => res,
        }
    }
    replaceOne(query, doc) {
        let index = this.db.source[this.name].findIndex(doc => checkQuery(query, doc));
        if (index > -1) {
            this.db.source[this.name][index] = doc;
        } else {
            this.db.source[this.name].push(doc)
        }

    }
}


Master.onCreate = async function(data) {
    if (!data.db || !data.collections) return; // TODO
    this.dbName = data.db;

    if (data.virtualDb) {
        this.db = new VirtualMongoDB(data.db, data.virtualDb);
        for (let collection of data.collections) {
            this[collection] = this.db.collection(collection);
        }
        return;
    }

    const client = new MongoClient(databaseUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return new Promise((resolve, reject) => {
        client.connect((err, connection) => {
            if (!connection) reject('No database connection');
            this.db = client.db(data.db);
            for (let collection of data.collections) {
                this[collection] = this.db.collection(collection);
            }
            resolve();
        });
    });
}

module.exports = Master
