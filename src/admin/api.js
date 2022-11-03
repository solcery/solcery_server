const Master = { api: {} }

Master.api['core.reloadServers'] = async function(params) {
    assert(params.userId === 'TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
    let core = this.core;
    for (engine of core.getAll(Engine)) {
        engine.delete();
    }
    for (pvpServer of core.getAll(PvpServer)) {
        pvpServer.delete();
    }
}

Master.api['core.eval'] = async function(params) {
    assert(params.userId === 'TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
    let code = params.code;
    try {
        var res = eval(params.code)
    } catch(e) {
        return e.message;
    } finally {
        return res;
    }
}

module.exports = Master;
