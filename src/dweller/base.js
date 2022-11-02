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

Master.init = function(data) {
    let time = this.time();
    this.id = data.id;
    this.core = data.core;
    this.parent = data.parent;
    this.disabledMixins = {};
    this.lastTickTime = time;
    this.creationTime = time;
}

Master.create = function(classObject, data) {
    assert(data, 'Dweller create error: no data provided!');
    assert(!this.get(classObject, data.id), `Failed to create ${classObject.classname}: object with id ${data.id} already exists!`);
    let obj = Object.create(classObject);
    data.parent = this;
    data.core = this.core;
    obj.init(data);
    objset(this, obj, 'objects', classObject.classname, data.id)
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

Master.time = function() {
    return env.time();
}

Master.updateProcessTime = function(time) {
    if (!time) return;
    if (!this.processTime || this.processTime > time) {
        this.processTime = time;
    }
}

Master.process = function(time) {
    delete this.processTime;
    this.execAllMixins('onProcess', time);
}

Master.tick = function(time) {
    time = time ?? this.time();
    let delta = time - self.lastTickTime;
    this.execAllMixins('onTick', time, delta);
    if (this.processTime && (this.processTime <= time)) {
        this.process(time)
    }
    for (let classObjects in Object.values(this.objects)) {
        for (let object of Object.values(classObjects)) {
            object.tick(time);
        }
    }
    this.lastTickTime = time;
}

module.exports = Master;
