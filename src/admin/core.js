const Master = {}

Master.onCreate = function(data) { // TODO: move to loader mixin?
  this.create(Mongo, {
      id: 'solcery',
      db: 'solcery',
      collections: [
        'objects',
      ],
  })
}

module.exports = Master;
