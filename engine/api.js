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
      await engine.updateConfig(params.fields);
}

Master.api['engine.sync'] = async function(params) {
      let engine = this.engine(params);
      let config = await engine.getConfig();
      let sync = config.sync;
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

Master.api['engine.release'] = async function(params) {
      let engine = this.engine(params);
      let config = await engine.getConfig();
      let gameId = config.fields.releaseProjectId;
      assert(gameId, 'Release API error: This project is not connected to game server. Check confiig')
      let gameServer = engine.core.get(GameServer, gameId);
      assert(gameServer, `Release API error: No game server with for game '${gameId}'`);
      let gameMongo = gameServer.get(Mongo, 'main');
      assert(gameMongo, 'No mongo connection!'); // TODO
      let currentLatest = await gameMongo.versions.count();
      let dist = {
         version: currentLatest + 1,
         content: {
               meta: params.contentMeta,
               web: params.contentWeb,
               unity: params.contentUnity
         }
      }
      let gameSettings = objget(params, 'contentMeta', 'gameSettings');
      assert(gameSettings, 'Release API error: No game settings provided in contentMeta param!')
      var update = { $set: gameSettings };

      let forgeMongo = this.core.get(Mongo, 'nfts');
      let supportedCollections = objget(params, 'contentMeta', 'collections');
      if (forgeMongo && supportedCollections) {
         supportedCollections = Object.values(supportedCollections).map(col => ObjectId(col.collection));
         supportedCollections = await this.forgeMongo.objects
               .find({ 
                     _id: { $in: supportedCollections },
                     template: 'collections',
               })
               .toArray();
         supportedCollections = supportedCollections.map(collection => ({
               name: collection.fields.name,
               image: collection.fields.logo,
               magicEdenUrl: collection.fields.magicEdenUrl,
         }))
         update['$set'].supportedCollections = supportedCollections;
      }
      await gameMongo.gameInfo.updateOne({}, update);
      await gameMongo.versions.insertOne(dist);
      return currentLatest + 1;
}

Master.api['core.reloadEngines'] = async function(params) {
      await this.core.loadEngines();
      return 'Engines reloaded, current number of engines: ' + this.core.getAll(Engine).length;
}

module.exports = Master;
