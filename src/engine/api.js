const Master = { entrypoints: {} };

Master.entrypoints.engine = function(params, ctx) {
      let engine = this.core.get(Engine, params.projectId);
      assert(engine, `API Error: No project with projectId id '${params.projectId}'`);
      return engine;
}

module.exports = Master;
