const Master = {};

Master.onExpressAppCreated = function(app) {
    this.create(Api, {
        id: 'api',
        loadedModules: this.loadedModules,
        app
    })
}


module.exports = Master
