const Master = { api: {} }

Master.api['core.reloadServers'] = async function(params) {
    assert(params.userId === 'TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
    let core = this.core;
    for (engine of core.getAll(Engine)) {
        engine.delete();
    }
    for (gameServer of core.getAll(GameServer)) {
        gameServer.delete();
    }
}

Master.api['core.eval'] = async function(params) {
    assert(params.userId === 'TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
    let code = params.code;
    return await eval(params.code);
}

module.exports = Master;
