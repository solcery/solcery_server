const Master = {}

Master.onCreate = function(data) {
  if (!data.db) return;
  this.create(Mongo, {
      id: 'solcery',
      db: data.db,
      collections: [
        'objects',
      ],
  })
}

module.exports = Master;
