const Dweller = {};

function addMixin(base, mixin) {
    assert(base)
    assert(mixin._name, 'Attempt to apply unnamed mixin!')
    for (let propName in mixin) {
        if (propName === '_name') continue;
        let prop = mixin[propName];
        if (typeof prop === 'function' && propName.substring(0, 2) === 'on') {
            objset(base, prop, 'callbacks', propName, mixin._name);
        } else {
            assert(!base[propName], `Error applying mixin '${mixin._name}' to '${base.classname}'! Name conflicted property '${propName}'`)
            base[propName] = mixin[propName];
        }
    }
}

function removeMixin(base, mixin) {
    assert(base)
    assert(mixin._name)
    for (let propName in mixin) {
        if (propName === '_name') continue;
        let prop = mixin[propName];
        if (typeof prop === 'function') {
            if (propName.substring(0, 2) === 'on') {
                delete base.callbacks[propName][mixin._name]
            } else {
                delete base[propName];
            }
        } 
    }
}

Dweller.disableMixinCallbacks = function(mixin) {
    this.disabledMixins[mixin._name] = true;
}

Dweller.execAllMixins = function(event, ...args) {
    let proto = Object.getPrototypeOf(this);
    let classCallbacks = objget(proto, 'callbacks', event);
    if (classCallbacks) {
        for (let [ mixinName, callback ] of Object.entries(classCallbacks)) {
            if (this.disabledMixins[mixinName]) continue;
            callback.apply(this, args);
        }
    }
}

Dweller.create = function(classObject, data) {
    assert(data, 'Dweller create error: no data provided!');
    assert(!this.get(classObject, data.id), `Failed to create ${classObject.classname}: dweller with id ${data.id} already exists!`);
    let obj = Object.create(classObject);
    obj.id = data.id;
    obj.core = this.core;
    obj.disabledMixins = {};
    objset(this, obj, 'objects', classObject.classname, data.id)
    obj.parent = this;
    obj.execAllMixins('onCreate', data);
    return obj;
}

Dweller.delete = function() {
    this.deleting = true;
    this.execAllMixins('onDelete');
    if (this.parent) {
        delete this.parent.objects[this.classname][this.id]
    }
}

Dweller.get = function(classObject, id) {
    return objget(this, 'objects', classObject.classname, id);
}

Dweller.getAll = function(classObject) {
    let result = [];
    let classObjects = objget(this, 'objects', classObject.classname);
    if (!classObjects) return result;
    for (let object of Object.values(classObjects)) {
        result.push(object)
    }
    return result
}

global['Dweller'] = Dweller;

module.exports = { addMixin, removeMixin }
