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
        return this.db.source[this.name];
    }
    count() {
        return Promise.resolve(this.db.source[this.name].length);
    }
    find(query) {
        let res = [];
        for (let doc of this.db.source[this.name]) {
            if (checkQuery(query, doc)) {
                res.push(doc)
            }
        }
        return new Response(res)
    }
    
    findOne(query) {
        for (let doc of this.db.source[this.name]) {
            if (checkQuery(query, doc)) {
                return doc;
            }
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