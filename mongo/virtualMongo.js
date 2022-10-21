const { ObjectId } = require('mongodb');

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
        if (field === '_id') {
            if (doc._id.toString() !== value.toString()) return false;
            continue;
        }
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
        this.source = this.db.source[this.name];
    }
    insertOne(obj) {
        if (!obj._id) {
            obj._id = new ObjectId();
        }
        objinsert(this.db.source, obj, this.name);
        return {
            acknowledged: true,
            insertedId: obj._id.toString(),
        }
    }
    deleteOne(query) {
        for (let index in this.source) {
            if (checkQuery(query, this.source[index])) {
                this.source.splice(index, 1);
                return { 
                    acknowledged: true,
                    deletedCount: 1,
                }
            }
        }
        return {
            acknowledged: true,
            deletedCount: 0
        }
    }
    updateOne(query, update, config) {
        if (config) {
            if (config.upsert) throw ('Not supported!');
        }
        let obj = this.findOne(query);
        if (!obj) return {
            acknowledged: true,
            matchedCount: 0,
            modifiedCount: 0,
        };
        if (update['$set']) {
            for (let [ prop, value ] of Object.entries(update['$set'])) {
                let path = prop.split('.');
                objset(obj, value, ...path);
            }
        }
        if (update['$unset']) {
            for (let [ prop, value ] of Object.entries(update['$unset'])) {
                let path = prop.split('.');
                objset(obj, null, ...path);
            }
        }
        return {
            acknowledged: true,
            matchedCount: 1,
            modifiedCount: 1,
        }
    }
    dump() {
        return source;
    }
    count() {
        return Promise.resolve(this.source.length);
    }
    findOne(query) {
        for (let doc of this.source) {
            if (checkQuery(query, doc)) {
                return doc;
            }
        }
    }
    find(query) {
        let res = [];
        for (let doc of this.source) {
            if (checkQuery(query, doc)) {
                res.push(doc)
            }
        }
        return new Response(res)
    }
    
    findOne(query) {
        for (let doc of this.source) {
            if (checkQuery(query, doc)) {
                return doc;
            }
        }
    }

    replaceOne(query, doc) {
        let index = this.source.findIndex(doc => checkQuery(query, doc));
        if (index > -1) {
            this.source[index] = doc;
        } else {
            this.source.push(doc)
        }
    }

    bulkWrite(operations) {
        for (let operation of operations) {
            if (operation.updateOne) {
                this.updateOne(operation.updateOne.filter, operation.updateOne.update)
            }
        }
        return {
            acknowledged: true
        }
    }
}

class Response {
    constructor (documents) {
        this.documents = [...documents];
    }

    then(onSuccess) {
        onSuccess(this.documents)
    }

    toArray() {
        return new Response(this.documents);
    }

    sort(data) {
        let [key, order] = Object.entries(data)[0];
        return new Response(this.documents.sort((a, b) => a[key] < b[key] ? order : -order));
    }

    limit(limit) {
        if (limit === 1) {
            return this.documents[0];
        }
        return new Response(this.documents.slice(limit))
    }

}

module.exports = VirtualMongoDB;