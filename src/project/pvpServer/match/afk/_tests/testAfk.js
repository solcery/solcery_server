const { ObjectId } = require("mongodb");

const gameBuild = { 
	_id: ObjectId(),
	version: 1,
	content: {
		web: {
			gameSettings: {

			},
			commands: {
				1: {
					action: {
						lib: 'action',
						func: 'void',
					}
				},
				2: {
					action: {
						lib: 'action',
						func: 'void',
					}
				}
			},
			players: {
				3: {
					index: 1,
					afkTimeout: {
						lib: 'value',
						func: 'const',
						params: {
							value: 1000
						}
					},
					afkAction: {
						lib: 'action',
						func: 'command',
						params: {
							command_id: 2,
							object_id: {
								lib: 'value',
								func: 'const',
								params: {
									value: 0
								}
							}
						}
					}
				},
				4: {
					index: 2,
				}
			}
		}
	}
}


const virtualDb = {
	dbs: {
		testDb: {
			gameBuilds: [
				gameBuild,
			],
			gameInfo: [
				{
					_id: ObjectId(),
					gameBuildVersion: 1
				}
			]
		}
	}
}



async function test(testEnv) {
	const core = createCore({ virtualDb });
	let project = core.create(Project, {
		pvpServer: true,
		db: 'testDb'
	});
	let match = project.create(Match, {
		version: 1,
		gameBuild,
		id: 'match',
	});
	let player1 = project.create(Player, { id: 'player1' });
	let player2 = project.create(Player, { id: 'player2' });
	match.addPlayer(player1);
	match.addPlayer(player2);
	match.start();


	match.execAllMixins('onPlayerAction', player1, {
		type: 'gameCommand',
		commandId: 1,
	})

	env.skip(1200);
	core.tick();

	env.skip(1200);
	core.tick();
	assert(match.actionLog.length === 4);
	assert(match.actionLog[1].commandId === 1 && match.actionLog[1].player === 'player1')
	assert(match.actionLog[2].commandId === 2 && match.actionLog[2].player === 'player1')
	assert(match.actionLog[3].commandId === 2 && match.actionLog[3].player === 'player1')
}

module.exports = { test }
