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

// API
Master.getUnityBuild = async function(buildId) {
      let res = await this.get(Mongo, 'solcery').objects.findOne({ _id: ObjectId(buildId) });
      assert(res);
      console.log('core: ', res)
      return res.fields;
}

module.exports = Master;
