const Master = {};

Master.onCreate = function (data) {
    this.create(Api, {
        id: 'api',
        loadedModules: this.loadedModules,
    })
    
}

module.exports = Master
