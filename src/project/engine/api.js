const { ObjectId } = require("mongodb");
const Master = { api: { engine: {} } };

Master.api.engine.ctx = function(params, ctx) {
      ctx.project = this.core.get(Project, params.projectId);
      // console.log('ctx engine', ctx.project)
      assert(ctx.project, `API Error: No project with projectId id '${params.projectId}'`);
}

Master.api.engine.getContent = async function(params, ctx) {
      return await ctx.project.exportContent(params);
}

Master.api.engine.restore = async function(params, ctx) {
      await ctx.project.importContent(params.src);
}

Master.api.engine.getConfig = async function(params, ctx) {
      return await ctx.project.getConfig();
}

Master.api.engine.setConfig = async function(params, ctx) {
      await ctx.project.updateConfig(params.fields);
}

Master.api.engine.sync = async function(params, ctx) {
      let config = await ctx.project.getConfig();
      let sync = config.sync;
      assert(sync, 'Sync API error: Project cannot be synced, see project config!');
      assert(sync.sourceProjectId, 'Sync API error: No sourceProjectId in sync config!');
      assert(!sync.isLocked, 'Sync API error: Synchronization is locked!');
      let sourceProject = ctx.project.core.get(Project, sync.sourceProjectId);
      assert(sourceProject, `Sync API error: No source project with id ${sync.sourceProjectId} found!`);
      let content = await sourceProject.exportContent({ templates: true, objects: true });
      await ctx.project.importContent(content);
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
            await ctx.project.contentDb.objects.bulkWrite(objectsQuery)
      }
      if (templatesQuery.length > 0) {
            await ctx.project.contentDb.templates.bulkWrite(templatesQuery)
      }
}

Master.api.engine.release = async function(params, ctx) {
      let config = await ctx.project.getConfig();
      let gameId = config.releaseProjectId;
      assert(gameId, 'Release API error: This project is not connected to game server. Check confiig')
      let pvpServer = ctx.project.core.get(Project, gameId);
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

      let forgeMongo = ctx.project.core.get(Mongo, 'nfts');
      let supportedCollections = objget(params, 'content', 'meta', 'collections');
      if (forgeMongo && supportedCollections) {
            supportedCollections = Object.values(supportedCollections).map(col => ObjectId(col.collection));
            supportedCollections = await ctx.project.forgeMongo.objects
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
      let solceryMongo = ctx.project.core.get(Mongo, 'solcery');
      assert(solceryMongo, 'Release API error: No system mongo!');
      let unityBuild = await solceryMongo.objects.findOne({ _id: ObjectId(unityBuildId) });
      dist.unityBuild = unityBuild.fields;

      await gameMongo.gameInfo.updateOne({}, update);
      await gameMongo.versions.insertOne(dist);
      return currentLatest + 1;
}

// Master.api['core.reloadEngines'] = async function(params) {
//       await ctx.project.core.loadEngines();
//       return 'Engines reloaded, current number of engines: ' + ctx.project.core.getAll(Engine).length;
// }

module.exports = Master;
