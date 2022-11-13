const Master = { api: { admin: {} } }

Master.api.admin.ctx = function(params, ctx) {
    assert(params.userId === 'TEUZkqw3bGDn4To6C7KNcckgoLiSLSZWaGJSWx8beFz');
}

Master.api.admin.eval = async function(params, ctx) {
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
