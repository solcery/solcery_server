const Master = {};

Master.onCreate = function(data) {
    this.api = this.create(Api, { id: 'main' });
}

module.exports = Master
