const Dweller = {};

Dweller.onCreate = function(data) {
    console.log('api: Core.onCreate ', data);
    this.create(Api, { id: 1 });
}

module.exports = Dweller
