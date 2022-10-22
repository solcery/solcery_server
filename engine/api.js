const { ObjectId } = require('mongodb');
const Master = { api: {} };

Master.engine = function(params) {
      let engine = this.core.get(Engine, params.gameId);
      assert(engine, `API Error: No engine with game id '${params.gameId}'`);
      return engine
}

Master.api['engine.getContent'] = async function(params) {
      let engine = this.engine(params);
      return await engine.exportContent(params);
}

Master.api['engine.restore'] = async function(params) {
      let engine = this.engine(params);
      await engine.importContent(params.src);
}

Master.api['engine.getConfig'] = async function(params) {
      let engine = this.engine(params);
      return await engine.getConfig();
}

Master.api['engine.setConfig'] = async function(params) {
      let engine = this.engine(params);
      let fields = {};
      for (let [ field, value ] of Object.entries(params.fields)) {
            fields[`fields.${field}`] = value;
      };
      await engine.updateConfig({ $set: fields });
}

Master.api['engine.sync'] = async function(params) {
      let engine = this.engine(params);
      let config = await engine.getConfig();
      let sync = objget(config, 'fields', 'sync');
      assert(sync, 'Sync API error: Project cannot be synced, see project config!');
      assert(sync.sourceProjectId, 'Sync API error: No sourceProjectId in sync config!');
      assert(!sync.isLocked, 'Sync API error: Synchronization is locked!');
      let sourceEngine = this.core.get(Engine, sync.sourceProjectId);
      assert(sourceEngine, `Sync API error: No source project with id ${sync.sourceProjectId} found!`);
      let content = await sourceEngine.exportContent({ templates: true, objects: true });
      await engine.importContent(content);
}

Master.api['engine.migrate'] = async function(params) {
      let engine = this.engine(params);
      let { objects, templates, newObjects, newTemplates } = params;
      let objectsQuery = [];
      let templatesQuery = [];
      if (objects) {
            for (let object of objects) {
                  object._id = ObjectId(object._id);
                  objectsQuery.push({
                        replaceOne: {
                              filter: { _id: ObjectId(object._id) },
                              replacement: object,
                        }
                  })
            }
      }
      if (newObjects) {
            for (object of newObjects) {
                  object._id = ObjectId(object._id);
                  objectsQuery.push({
                        insertOne: {
                              document: object
                        }
                  })
            }
      }

      if (templates) {
            for (let template of templates) {
                  template._id = ObjectId(template._id);
                  templatesQuery.push({
                        replaceOne: {
                              filter: { _id: ObjectId(template._id) },
                              replacement: template,
                        }
                  })
            }
      }
      if (newTemplates) {
            for (let template of newTemplates) {
                  template._id = ObjectId(template._id);
                  templatesQuery.push({
                        insertOne: {
                              document: template
                        }
                  })
            }
      }
      if (objectsQuery.length > 0) {
            await engine.content.objects.bulkWrite(objectsQuery)
      }
      if (templatesQuery.length > 0) {
            await engine.content.templates.bulkWrite(templatesQuery)
      }
}

module.exports = Master;
