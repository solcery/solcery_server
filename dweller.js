const Dweller = {};

function addMixin(base, mixin) {
    for (let propName in mixin) {
        let prop = mixin[propName];
        if (typeof prop === 'function' && propName.substring(0, 2) === 'on') {
            objinsert(base, prop, 'callbacks', propName);
        } else {
            base[propName] = mixin[propName];
        }
    }
}

Dweller.execAllMixins = function(event, ...args) {
    let proto = Object.getPrototypeOf(this);
    let callbacks = objget(proto, 'callbacks', event)
    if (callbacks) {
        for (let callback of callbacks) {
            callback.apply(this, args);
        }
    }
    // TODO: onEvent generic handler
}

    //TODO
// Dweller.awaitAllMixins = async function(event, ...args) {
    // let proto = Object.getPrototypeOf(this);
    // if (proto.eventHandlers) {
    //     let handlers = proto.eventHandlers[event];
    //     if (handlers) {
    //         for (let handler of handlers) {
    //             await handler.apply(this, args);
    //         }
    //     }
    //     handlers = proto.eventHandlers['onEvent'];
    //     if (handlers) {
    //         for (let handler of handlers) {
    //             await handler.apply(this, [ event ].concat(args));
    //         }
    //     }

    // }
// }

Dweller.create = function(classObject, data) {
    let obj = Object.create(classObject);
    obj.id = data.id;
    obj.core = this.core;
    objset(this, obj, 'objects', classObject, data.id)
    obj.parent = this
    obj.execAllMixins('onCreate', data);
    return obj;
}

Dweller.get = function(classObject, id) {
    if (this.objects && this.objects[classObject.classname]) {
        return this.objects[classObject.classname][id]
    }
}

Dweller.getAll = function(classObject) {
    let result = [];
    if (this.objects && this.objects[classObject.classname]) {
        let objects = this.objects[classObject.classname]
        for (let objId in objects) {
            result.push(objects[objId])
        }
    }
    return result
}

module.exports = { Dweller, addMixin }