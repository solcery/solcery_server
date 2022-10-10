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

Dweller.execAllMixins = async function(event, ...args) {
    let proto = Object.getPrototypeOf(this);
    let classCallbacks = objget(proto, 'callbacks', event);
    // Generic dweller mixin
    // let dweller = Object.getPrototypeOf(proto);
    // let dwellerCallbacks = objget(dweller, 'callbacks', event);
    // if (dwellerCallbacks) {
    //     for (let callback of dwellerCallbacks) {
    //         await callback.apply(this, args);
    //     }
    // }
    if (classCallbacks) {
        for (let callback of classCallbacks) {

            await callback.apply(this, args);
        }
    }
}

Dweller.create = function(classObject, data) {
    assert(data, 'Dweller create error: no data provided!');
    let obj = Object.create(classObject);
    obj.id = data.id;
    obj.core = this.core;
    objset(this, obj, 'objects', classObject.classname, data.id)
    obj.parent = this
    obj.execAllMixins('onCreate', data);
    return obj;
}

Dweller.get = function(classObject, id) {
    return objget(this, 'objects', classObject.classname, id);
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

global['Dweller'] = Dweller;

module.exports = { addMixin }