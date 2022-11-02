const Master = {
    _name: 'dweller',
};

Master.disableMixinCallbacks = function(mixin) {
    this.disabledMixins[mixin._name] = true;
}

Master.execAllMixins = function(event, ...args) {
    let proto = Object.getPrototypeOf(this);
    let classCallbacks = objget(proto, 'callbacks', event);
    if (classCallbacks) {
        for (let [ mixinName, callback ] of Object.entries(classCallbacks)) {
            if (this.disabledMixins[mixinName]) continue;
            callback.apply(this, args);
        }
    }
}

Master.create = function(classObject, data) {
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

Master.delete = function() {
    this.deleting = true;
    this.execAllMixins('onDelete');
    if (this.parent) {
        delete this.parent.objects[this.classname][this.id]
    }
}

Master.get = function(classObject, id) {
    return objget(this, 'objects', classObject.classname, id);
}

Master.getAll = function(classObject) {
    let result = [];
    let classObjects = objget(this, 'objects', classObject.classname);
    if (!classObjects) return result;
    for (let object of Object.values(classObjects)) {
        result.push(object)
    }
    return result
}

module.exports = Master;
