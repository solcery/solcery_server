function addMixin(dweller, mixin) {
    assert(mixin._name, 'Attempt to apply unnamed mixin!');
    let mixinName = mixin._name;
    let requiredMixins = objget(env.config, 'mixins', mixinName, 'requiredMixins');
    if (requiredMixins) {
        for (let requiredMixinName of Object.keys(requiredMixins)) {
            addMixin(dweller, requiredMixinName);
        }
    }
    if (dweller.mixins[mixinName]) return; // Do not apply mixins twice to the same dweller
    dweller.mixins[mixinName] = mixin;
    for (let propName in mixin) { // TODO: to objmerge?
        if (propName === '_name') continue;
        let prop = mixin[propName];
        if (propName === 'callbacks') {
            // TODO:
            continue;
        }
        if (typeof prop === 'object') { // Object props are merged
            dweller[propName] = dweller[propName] ?? {};
            objmerge(dweller[propName], prop);
            continue;
        }
        if (typeof prop === 'function' && propName.substring(0, 2) === 'on') {
            objset(dweller, prop, 'callbacks', propName, mixin._name);
        } else {
            assert(!dweller[propName], `Error applying mixin '${mixin._name}' to '${dweller.classname}'! Name conflicted property '${propName}'`)
            dweller[propName] = mixin[propName];
        }
    }
}

function removeMixin(base, mixin) { // TODO: check dependencies
    assert(base.mixins[mixin._name]);
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
    delete base.mixins[mixin._name]
}

module.exports = { addMixin, removeMixin }
