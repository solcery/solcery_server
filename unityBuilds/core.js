const { ObjectId } = require('mongodb');
const Master = {}

Master.onCreate = function(data) {
      this.create(Mongo, {
            id: 'solcery',
            db: 'solcery',
            collections: [
                  'objects',
            ],
      })
}

module.exports = Master;
