const { ObjectId } = require('mongodb');

function filterInPlace(a, condition, thisArg) {
    let j = 0;

    a.forEach((e, i) => { 
        if (condition.call(thisArg, e, i, a)) {
            if (i!==j) a[j] = e; 
            j++;
        }
    });

    a.length = j;
    return a;
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
    insertMany(objects) {
        for (let obj of objects) {
            this.insertOne(obj);
        }
        return {
            acknowledged: true,
            insertedCount: objects.length,
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
    deleteMany(query) {
        let oldLength = this.source.length;
        filterInPlace(this.source, item => !checkQuery(query, item));
        return {
            acknowledged: true,
            deletedCount: this.source.length - oldLength,
        }
    }
    updateOne(query, update, config) {
        if (config) {
            if (config.upsert) throw ('Not supported!');
        }
        let obj;
        for (let doc of this.source) {
            if (checkQuery(query, doc)) {
                obj = doc;
                break;
            }
        }
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
        return this.source;
    }

    count() {
        return Promise.resolve(this.source.length);
    }

    findOne(query) {
        for (let doc of this.source) {
            if (checkQuery(query, doc)) {
                return Promise.resolve(doc);
            }
        }
        return Promise.resolve(undefined);
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


    replaceOne(query, replacement) {
        let index = this.source.findIndex(doc => checkQuery(query, doc));
        if (index > -1) {
            this.source[index] = replacement;
        } else {
            this.source.push(replacement)
        }
    }

    bulkWrite(operations) {
        for (let operation of operations) {
            if (operation.updateOne) {
                this.updateOne(operation.updateOne.filter, operation.updateOne.update)
            }
            if (operation.replaceOne) {
                this.replaceOne(operation.replaceOne.filter, operation.replaceOne.replacement)
            }
            if (operation.insertOne) {
                this.insertOne(operation.insertOne.document)
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