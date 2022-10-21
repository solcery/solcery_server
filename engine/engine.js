const { ObjectId } = require("mongodb");
const Master = {}

Master.onCreate = function(data) {
	this.create(Mongo, {
		id: 'content',
		db: data.gameId,
		virtualDb: data.virtualDb,
		collections: [
			'objects',
			'templates',
			'users',
			'logs'
		]
	})
}

Master.onProjectConfigUpdate = function(data) {
	let gameProjectId = objget(data, 'config', 'releaseProjectId');
	if (!gameProjectId) return;
	this.create(Mongo, { 
		id: 'game',
		db: gameProjectId,
		collections: [
			'versions',
			'gameInfo'
		]
	})
}

Master.restoreContent = async function (data) {
	let result = {}
	let { objects, templates } = data;
	if (templates) {
		templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
		await this.mongo.templates.remove({});
		await this.mongo.templates.insertMany(templates, function (err, res) {
		    if (err) throw err;
		    result.templates = res;
		});
	}
	if (objects) {
		objects.forEach(obj => obj._id = ObjectId(obj._id));
		await this.mongo.objects.remove({});
		await this.mongo.objects.insertMany(objects, function (err, res) {
		    if (err) throw err;
		    result.objects = res;
		});
	}
	return result;
}

Master.onApiCommandGetContent = async function(result, params) {
	let { objects, templates } = await this.getContent(params);
	result.objects = objects;
	result.templates = templates;
}

Master.onApiCommandRestore = async function (result, params) {
	await this.restoreContent(params.src)
	result.status = true
}

Master.onApiCommandGetConfig = async function(result, params) {
	return this.config;
}

Master.onApiCommandSetConfig = async function(result, params) {
	let fields = {}
	for (let [ field, value ] of Object.entries(params.fields)) {
		fields[`fields.${field}`] = value;
	}
	var update = { $set: fields };
	await this.mongo.config.updateOne({}, update);
}

Master.onApiCommandSync = async function(result, params) {
	let config = await this.mongo.config.findOne({});
	let sync = objget(config, 'fields', 'sync')
	assert(sync, 'Sync API error: Project cannot be synced, see project config!');
	assert(sync.sourceProjectId, 'Sync API error: No sourceProjectId in sync config!');
	assert(!sync.isLocked, 'Sync API error: Synchronization is locked!');
	let sourceEditor = this.core.get(Editor, sync.sourceProjectId);
	assert(sourceEditor, 'Sync API error: No source project found!');
	let src = await sourceEditor.getContent({ templates: true, objects: true });
	await this.restoreContent(src)
}

Master.onApiCommandMigrate = async function(result, params) {
	let { objects, templates, newObjects, newTemplates } = params;
	let objectsQuery = [];
	let templatesQuery = [];
	if (objects) {
		for (let object of objects) {
			objectsQuery.push({
				replaceOne: {
					filter: { _id: ObjectId(object._id) },
					replacement: { fields: obj.fields },
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
			templatesQuery.push({
				replaceOne: {
					filter: { _id: ObjectId(object._id) },
					replacement: template,
				}
			})
		}
    }
    if (newTemplates) {
     	for (template of newTemplates) {
     		template._id = ObjectId(template._id);
		  	templatesQuery.push({
		  		insertOne: {
		  			document: template
		  		}
		  	})
     	}
	}
	if (objectsQuery.length > 0) {
		await this.mongo.objects.bulkWrite(objectsQuery)
	}
	if (templatesQuery.length > 0) {
		await this.mongo.templates.bulkWrite(templatesQuery)
	}
}

Master.onApiCommandRelease = async function(result, params) {
	assert(this.gameMongo, 'Release API error: Project has no release specs in config!');
	let count = await this.gameMongo.versions.count();
	let dist = {
		_id: new ObjectId(),
		version: count + 1,
		content: {
			meta: params.contentMeta,
			web: params.contentWeb,
			unity: params.contentUnity
		}
	}
	let gameSettings = objget(params, 'contentMeta', 'gameSettings');
	assert(gameSettings, 'Release API error: No game settings provided in contentMeta param!')
	var update = { $set: gameSettings };

	let supportedCollections = objget(params, 'contentMeta', 'collections');
	if (supportedCollections) {
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
	await this.gameMongo.gameInfo.updateOne({}, update);
	await this.gameMongo.versions.insertOne(dist);
}

module.exports = Master
