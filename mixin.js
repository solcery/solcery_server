function addMixin(dweller, mixinConfig) {
    assert(dweller);
    assert(mixinConfig);
    if (mixinConfig.requiredMixins) {
        for (let requiredMixinConfig of mixinConfig.requiredMixins) {
            addMixin(dweller, requiredMixinConfig);
        }
    }
    let mixin = mixinConfig.master;
    if (dweller.mixins[mixin._name]) return;
    assert(mixin._name, 'Attempt to apply unnamed mixin!')
    for (let propName in mixin) {
        if (propName === '_name') continue;
        let prop = mixin[propName];
        if (propName === 'api') {
            dweller.api = dweller.api ?? {};
            for (let [ apiCommand, apiFunc] of Object.entries(prop)) {
                assert(!dweller.api.apiCommand);
                dweller.api[apiCommand] = apiFunc;
            }
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

function removeMixin(base, mixinConfig) { // TODO: check dependencies
    assert(base)
    let mixin = mixinConfig.master;
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

module.exports = { addMixin, removeMixin }
