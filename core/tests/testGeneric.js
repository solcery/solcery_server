async function test() {
	const core = await createCore();

	await core.create(GameServer, { 
		id: 'game_polygon', 
		gameId: 'game_polygon', 
	});
}

module.exports = { test }
