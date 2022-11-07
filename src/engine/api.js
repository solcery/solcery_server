const { ObjectId } = require("mongodb");
const Master = { api: { engine: {} } };

Master.api.engine.ctx = function(params, ctx) {
      ctx.engine = this.core.get(Engine, params.projectId);
      assert(ctx.engine, `API Error: No project with projectId id '${params.projectId}'`);
}

Master.api.engine.getContent = async function(params, ctx) {
      return await ctx.engine.exportContent(params);
}

Master.api.engine.restore = async function(params, ctx) {
      await ctx.engine.importContent(params.src);
}

Master.api.engine.getConfig = async function(params, ctx) {
      return await ctx.engine.getConfig();
}

Master.api.engine.setConfig = async function(params, ctx) {
      await ctx.engine.updateConfig(params.fields);
}

Master.api.engine.sync = async function(params, ctx) {
      let config = await ctx.engine.getConfig();
      let sync = config.sync;
      assert(sync, 'Sync API error: Project cannot be synced, see project config!');
      assert(sync.sourceProjectId, 'Sync API error: No sourceProjectId in sync config!');
      assert(!sync.isLocked, 'Sync API error: Synchronization is locked!');
      let sourceEngine = ctx.engine.core.get(Engine, sync.sourceProjectId);
      assert(sourceEngine, `Sync API error: No source project with id ${sync.sourceProjectId} found!`);
      let content = await sourceEngine.exportContent({ templates: true, objects: true });
      await ctx.engine.importContent(content);
}

Master.api.engine.migrate = async function(params, ctx) {
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
            await ctx.engine.content.objects.bulkWrite(objectsQuery)
      }
      if (templatesQuery.length > 0) {
            await ctx.engine.content.templates.bulkWrite(templatesQuery)
      }
}

Master.api.engine.release = async function(params, ctx) {
      let config = await ctx.engine.getConfig();
      let gameId = config.releaseProjectId;
      assert(gameId, 'Release API error: This project is not connected to game server. Check confiig')
      let pvpServer = ctx.engine.core.get(PvpServer, gameId);
      assert(pvpServer, `Release API error: No game server with for game '${gameId}'`);
      let gameMongo = pvpServer.get(Mongo, 'main');
      assert(gameMongo, 'No mongo connection!'); // TODO
      let currentLatest = await gameMongo.versions.count();
      let dist = {
            version: currentLatest + 1,
            content: params.content
      }
      let gameSettings = objget(params, 'content', 'meta', 'gameSettings');
      assert(gameSettings, 'Release API error: No game settings provided in content/meta param!')
      var update = { $set: gameSettings };

      let forgeMongo = ctx.engine.core.get(Mongo, 'nfts');
      let supportedCollections = objget(params, 'content', 'meta', 'collections');
      if (forgeMongo && supportedCollections) {
            supportedCollections = Object.values(supportedCollections).map(col => ObjectId(col.collection));
            supportedCollections = await ctx.engine.forgeMongo.objects
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

      let unityBuildId = objget(params, 'content', 'meta', 'gameSettings', 'build');
      let solceryMongo = ctx.engine.core.get(Mongo, 'solcery');
      assert(solceryMongo, 'Release API error: No system mongo!');
      let unityBuild = await solceryMongo.objects.findOne({ _id: ObjectId(unityBuildId) });
      dist.unityBuild = unityBuild.fields;

      await gameMongo.gameInfo.updateOne({}, update);
      await gameMongo.versions.insertOne(dist);
      return currentLatest + 1;
}

// Master.api['core.reloadEngines'] = async function(params) {
//       await ctx.engine.core.loadEngines();
//       return 'Engines reloaded, current number of engines: ' + ctx.engine.core.getAll(Engine).length;
// }

module.exports = Master;
