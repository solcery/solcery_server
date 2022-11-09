const Master = {};

const AWS = require('aws-sdk');
const fs = require('fs');
const request = require('request');
const im = require('imagemagick');
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { Connection, PublicKey } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');
const path = require('path');

const connection = new Connection('https://solana-api.projectserum.com');
const metaplex = new Metaplex(connection);

const downloadAsFile = function(uri, filename, callback){
	request.head(uri, function(err, res, body){
		let extension = res.headers['content-type'].split('/')[1];
		request(uri).pipe(fs.createWriteStream(`${filename}.${extension}`)).on('close', () => callback(extension));
	});
};

const checkNftForAllCollections = (nft, collections) => {
	for (let collection of collections) {
		if (checkNftForCollection(nft, collection)) {
			return collection;
		}
	}
}

const checkNftForCollection = (nft, collection) => {
	let collectionFields = collection.fields
	if (collectionFields.symbol !== nft.symbol) return false;
	let verifiedNftCreators = nft.creators.filter(creator => creator.verified).map(creator => creator.address.toBase58());
	let verifiedCollectionCreators = collectionFields.creators ?? [];
	for (let creator of verifiedNftCreators) {
		if (!verifiedCollectionCreators.includes(creator)) return false;
	}
	for (let creator of verifiedCollectionCreators) {
		if (!verifiedNftCreators.includes(creator)) return false;
	}
	if (collectionFields.vc) { // verified collection
		let verifiedCollectionKey = objget(nft, 'collection', 'verified', 'key');
		if (!verifiedCollectionKey) return false;
		if (nft.collection.key.toBase58() !== collectionFields.vc) return false;
	}
	return true;
}

forgeNft = async function ({ nft, collection }, publicKey, dirName) {
	let metadata = await metaplex.nfts().load({ metadata: nft });

	let mint = nft.mintAddress.toBase58();
	if (!metadata.json) {
		// TODO: error
		return;
	}
	let imageUrl = metadata.json.image;
	return new Promise(resolve => {
		downloadAsFile(imageUrl, path.join(dirName, `orig_${mint}`), (extension) => {
			im.resize({
				srcPath: path.join(dirName, `orig_${mint}.${extension}`),
				dstPath: path.join(dirName, `${mint}.jpg`),
				width: "512!",
				height: "512!",
			}, function(err, stdout, stderr) {
				if (err) console.log(imageUrl);
				if (err) throw err;

				const s3 = new AWS.S3({
					accessKeyId: process.env.AWS_ID,
					secretAccessKey: process.env.AWS_KEY
				})

				const filename = `${mint}.jpg`;
				const fileContent = fs.readFileSync(path.join(dirName,filename));
				const params = {
					Bucket: 'solcery-nfts',
					Key: `nfts/${filename}`,
					Body: fileContent
				}
				const cloudFrontUrl = process.env.CLOUDFRONT_URL;

				let x = s3.upload(params, (err, data) => {
					if (err) throw err;
					resolve({
						mint,
						forger: publicKey.toBase58(),
						creationTime: Math.floor(Date.now() / 1000),
						name: nft.name,
						image: `${cloudFrontUrl}/nfts/${filename}`,
						collection: collection._id.toString(),
					})
				})
			});
		});
	})
}

Master.onCreate = function(data) {
	// this.mongo = this.create(Mongo, {
	// 	id: 'main',
	// 	db: 'nfts',
	// 	collections: [ 'objects' ],
	// })
}

Master.getNfts = async function(mintPubkeys) {
	let res = await this.mongo.objects.find({ 
		template: 'nfts', 
		'fields.mint': { 
			$in: mintPubkeys 
		}
	}).toArray();
 	return res.map(nft => nft.fields);
}

Master.getPlayerNfts = async function(pubkey) {
	let publicKey = new PublicKey(pubkey);
	let parsedTokens = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }); // TODO: filter?
	parsedTokens = parsedTokens.value.filter(token => token.account.data.parsed.info.tokenAmount.uiAmount === 1);
	let mints = parsedTokens.map(accountData => new PublicKey(accountData.account.data.parsed.info.mint));
	let nftDatas = await metaplex
		.nfts()
		.findAllByMintList({ mints });
	nftDatas = nftDatas.filter(nft => nft);
	let collections = await this.mongo.objects.find({ template: 'collections' }).toArray();
	let supportedNfts = [];
	for (let nft of nftDatas) {
			let collection = checkNftForAllCollections(nft, collections);
			if (!collection) continue;
			if (nft.mintAddress.toBase58() === 'AErFXRFobDFzy1A5KkoTGPagHh4HySaNZFUXxFDmFcy6') continue; //TODO;
			supportedNfts.push({ nft, collection });
	}
	let supportedNftMints = supportedNfts.map(nft => nft.nft.mintAddress.toBase58());
	let forgedNfts = await this.mongo.objects.find({ 
		template: 'nfts', 
		'fields.mint': { 
			$in: supportedNftMints 
		},
	}).toArray();
	let forgedNftMints = forgedNfts.map(nft => nft.fields.mint).filter(mint => mint);
	let unsupportedNfts = supportedNfts.filter(nft => !forgedNftMints.includes(nft.nft.mintAddress.toBase58()));
	if (unsupportedNfts.length === 0) {
		return forgedNfts.map(data => data.fields);
		// TODO: wrap forgedNftMints
	} else {
		let dirName = path.join('_tmp', uuid());
		fs.mkdirSync(dirName, { recursive: true });
		let forgedNftDatas = await Promise.all(unsupportedNfts.map(nft => forgeNft(nft, publicKey, dirName)));
		fs.rmSync(dirName, { 
			recursive: true, 
			force: true 
		});
		forgedNftDatas = forgedNftDatas.filter(nft => nft !== undefined); // TODO
		let newlyForgedNfts = forgedNftDatas.map(fields => ({
			template: 'nfts',
			fields
		}));
		let newlyForgedNftMints = newlyForgedNfts.map(nft => nft.fields.mint);
		let bulk = this.mongo.objects.initializeOrderedBulkOp();
		bulk.find({ template: 'nfts', 'fields.mint': { $in: newlyForgedNftMints }}).delete();
		for (let newlyForgedNft of newlyForgedNfts) {
			bulk.insert(newlyForgedNft)
		}
		await bulk.execute();
		return forgedNfts.concat(newlyForgedNfts).map(data => data.fields);
	}
}

module.exports = Master;
