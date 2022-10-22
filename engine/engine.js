const { ObjectId } = require("mongodb");
const Master = {}

Master.onCreate = function(data) {
	this.content = this.create(Mongo, {
		id: 'content',
		db: data.gameId,
		virtualDb: data.virtualDb,
		collections: [
			'objects',
			'templates',
			'users',
			'logs',
			'config'
		]
	})
}

Master.exportContent = async function(data) {
	let result = {}
	if (data.objects) {
		result.objects = await this.content.objects.find({}).toArray();
	}
	if (data.templates) {
		result.templates = await this.content.templates.find({}).toArray();
	}
	return result;
}

Master.importContent = async function(data) {
	let { templates, objects } = data;
	if (templates) {
		templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
		await this.content.templates.deleteMany({});
		await this.content.templates.insertMany(templates);
	}
	if (objects) {
		objects.forEach(obj => obj._id = ObjectId(obj._id));
		await this.content.objects.deleteMany({});
		await this.content.objects.insertMany(objects);
	}
}

Master.onApiCommandRelease = async function(result, params) {
	// assert(this.gameMongo, 'Release API error: Project has no release specs in config!');
	// let count = await this.gameMongo.versions.count();
	// let dist = {
	// 	_id: new ObjectId(),
	// 	version: count + 1,
	// 	content: {
	// 		meta: params.contentMeta,
	// 		web: params.contentWeb,
	// 		unity: params.contentUnity
	// 	}
	// }
	// let gameSettings = objget(params, 'contentMeta', 'gameSettings');
	// assert(gameSettings, 'Release API error: No game settings provided in contentMeta param!')
	// var update = { $set: gameSettings };

	// let supportedCollections = objget(params, 'contentMeta', 'collections');
	// if (supportedCollections) {
	// 	supportedCollections = Object.values(supportedCollections).map(col => ObjectId(col.collection));
	// 	supportedCollections = await this.forgeMongo.objects
	// 		.find({ 
	// 			_id: { $in: supportedCollections },
	// 			template: 'collections',
	// 	  	})
	// 		.toArray();
	// 	supportedCollections = supportedCollections.map(collection => ({
	// 		name: collection.fields.name,
	// 		image: collection.fields.logo,
	// 		magicEdenUrl: collection.fields.magicEdenUrl,
	// 	}))
	// 	update['$set'].supportedCollections = supportedCollections;
	// }
	// await this.gameMongo.gameInfo.updateOne({}, update);
	// await this.gameMongo.versions.insertOne(dist);
}

module.exports = Master
