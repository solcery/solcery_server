const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.api.getUnityBuild = async function(params) {
      let res = await this.core.solceryDb.objects.findOne({ _id: ObjectId(params.buildId) });
      return res.fields;
}

module.exports = Master;
