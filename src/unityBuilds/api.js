const { ObjectId } = require('mongodb');
const Master = { api: {} }

// API
Master.api['system.getUnityBuild'] = async function(params) {
      let res = await this.core.get(Mongo, 'solcery').objects.findOne({ _id: ObjectId(params.buildId) });
      return res.fields;
}

module.exports = Master;
