const Master = { api: {} }

Master.engine = function(params) {
      let engine = this.core.get(Engine, params.gameId);
      assert(engine, `API Error: No game with id '${params.gameId}'`);
      let mongo = engine.get(Mongo, 'content');
      assert(mongo, `API Error: EngineServer '${params.gameId}' doesn't have DB connection`);
      return { engine, mongo }
}

Master.api['engine.getContent'] = async function(params) {
      const { mongo } = this.engine(params);
      let result = {}
      if (params.objects) {
            result.objects = await mongo.objects.find({}).toArray();
      }
      if (params.templates) {
            result.templates = await mongo.templates.find({}).toArray();
      }
      return result;
}

module.exports = Master;
