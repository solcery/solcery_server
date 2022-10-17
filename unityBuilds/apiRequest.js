const Master = {}

// API
Master.getUnityBuild = async function(params) {
      return this.core.getUnityBuild(params.buildId);
}

module.exports = Master;
