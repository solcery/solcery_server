async function test(testEnv) {
	env.warn('FIX ME!')
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
}

module.exports = { test }
