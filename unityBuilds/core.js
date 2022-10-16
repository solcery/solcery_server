const { ObjectId } = require('mongodb');
const Master = {}

Master.onCreate = async function(data) {
      this.mongo = await this.create(Mongo, {
            id: 'solcery',
            db: 'solcery',
            collections: [
                  'objects',
            ],
      })
}

Master.onApiCommand = async function(commandPath, result, params) {
      if (commandPath[0] !== 'getUnityBuild') return;
      result.build = await this.getUnityBuild(params.buildId);
}

Master.getUnityBuild = async function(buildId) {
      let res = await this.mongo.objects.findOne({ _id: ObjectId(buildId) });
      assert(res);
      return res.fields;
}

module.exports = Master;