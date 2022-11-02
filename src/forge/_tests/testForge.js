async function test(testEnv) {
	console.log('FIX ME!')
	return;

	const core = createCore({
		db: 'solcery'
	});
	let api = core.get(Api, 'api');
	await sleep(300);
	assert(api);
	let apiCall = testEnv.createClientApi(api);

	let result = await apiCall({
		command: 'forge.getPlayerNfts',
		pubkey: 'DrANdHtiF3rSQi2X9sAVjL6ZrLhUPfwV3vfcA8LwPryf',
	})
	console.log(result)
}

module.exports = { test }
