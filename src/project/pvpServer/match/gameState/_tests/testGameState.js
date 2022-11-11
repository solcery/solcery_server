const { ObjectId } = require("mongodb");

const gameBuild = { 
	_id: ObjectId(),
	version: 1,
	content: {
		web: {
			gameAttributes: {
				1: {
					code: 'testGameAttr'
				}
			},
			attributes: {
				2: {
					code: 'testObjectAttr'
				},
				3: {
					code: 'place'
				}
			},
			gameSettings: {
				initAction: {
					lib: 'action',
					func: 'set_game_attr',
					params: {
						attr_name: 'testGameAttr',
						value: {
							lib: 'value',
							func: 'const',
							params: {
								value: 5
							}
						}
					}
				},
				layout: [ 'testLayout' ],
			},
			cards: {
				4: {
					preset: 'testLayout',
					place: 4,
					cards: [
						{
							cardType: 5,
							amount: 10,
						}
					]
				}
			},
			cardTypes: {
				5: {
					action_on_use: {
						lib: 'action',
						func: 'set_attr',
						params: {
							attr_name: 'testObjectAttr',
							value: {
								lib: 'value',
								func: 'add',
								params: {
									value1: {
										lib: 'value',
										func: 'attr',
										params: {
											attr_name: 'testObjectAttr',
										}
									},
									value2: {
										lib: 'value',
										func: 'const',
										params: {
											value: 1
										}
									}
								}
							}
						}
					}
				}
			},
			commands: {
				6: {
					action: {
						lib: 'action',
						func: 'iter',
						params: {
							condition: {
								lib: 'condition',
								func: 'eq',
								params: {
									value1: {
										lib: 'value',
										func: 'entity_id',
									},
									value2: {
										lib: 'value',
										func: 'scope_var',
										params: {
											var_name: 'object_id'
										}
									}
								}
							},
							action: {
								lib: 'action',
								func: 'event',
								params: {
									event_name: 'use',
								}
							},
							limit: {
								lib: 'value',
								func: 'const',
								params: {
									value: 1,
								}
							},
						}
					}
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
	let player1 = project.create(Player, {
		id: 'player1',
		pubkey: 'player1',
	});
	let player2 = project.create(Player, {
		id: 'player2',
		pubkey: 'player2',
	});
	match.addPlayer(player1);
	match.addPlayer(player2);
	match.start();
	match.addAction({
		type: 'gameCommand',
		commandId: 6,
		ctx: {
			object_id: 5,
		}
	})
	match.addAction({
		type: 'gameCommand',
		commandId: 6,
		ctx: {
			object_id: 5,
		}
	})
	match.addAction({
		type: 'gameCommand',
		commandId: 6,
		ctx: {
			object_id: 5,
		}
	})
	match.addAction({
		type: 'gameCommand',
		commandId: 6,
		ctx: {
			object_id: 8,
		}
	})
	let obj5 = match.gameState.objects['5'];
	assert(obj5.id === 5);
	assert(obj5.attrs.place === 4);
	assert(obj5.attrs.testObjectAttr === 3);
	let obj8 = match.gameState.objects['8'];
	assert(obj8.id === 8);
	assert(obj8.attrs.place === 4);
	assert(obj8.attrs.testObjectAttr === 1);

	// console.log(match)
	// const SERVER_NAME = 'testGameSrv';
	// const GAME_NAME = 'game_lightmor'
	// const PUBKEY1 = 'pubkey1';
	// const PUBKEY2 = 'pubkey2';

	// await core.create(Project, { 
	// 	id: SERVER_NAME, 
	// 	gameId: GAME_NAME,
	// 	,
	// });

 //    // console.log("game version", version);


	// let playerOne = await gameServer.create(Player, { 
	// 	id: PUBKEY1, 
	// 	pubkey: PUBKEY1 
	// });
	// let playerTwo = await gameServer.create(Player, { 
	// 	id: PUBKEY2, 
	// 	pubkey: PUBKEY2 
	// });
	// let game = await gameServer.createGame();

	// await game.addPlayer(playerOne);
	// await game.addPlayer(playerTwo);
	// await game.start();

	// /* Test GameState creation */

	// let content = gameVersion.content.web;
	// // console.log(content);
	// let gameState = game.create(GameState, {content: content, seed: 0 });

	// // console.log(gameState.inner.attrs);
	// assert(gameState);

	// // console.log("gameState was created");

	//  Test GameState start 

	// gameState.start(game.players);
	// // console.log(gameState.inner.objects);
	// // assert(Object.keys(gameState.inner.objects).length == 5);
	// // console.log("gameState was launched");

	// /* Test Apply Command */

	// // console.log("game attrs", gameState.inner.attrs);

	// // do nothing button
	// let rightButtonClick = {
	// 	commandId: 9, 
	// 	ctx: { object_id: 1 }
	// }
	// // get one point button
	// let leftButtonClick = {
	// 	commandId: 9, 
	// 	ctx: { object_id: 4 }
	// }

	// let command = rightButtonClick;
	// while(!gameState.inner.checkOutcome()) {
	// 	if (getRandomInt(2) == 0) {
	// 		command = rightButtonClick;
	// 	} else {
	// 		command = leftButtonClick;
	// 	}
	// 	command.ctx.player_index = gameState.inner.attrs.current_player + 1;
	// 	gameState.applyCommand(command);

	// 	// console.log("game attrs", gameState.inner.attrs);
	// 	// console.log("outcome", gameState.checkOutcome());
	// }

	// console.log("game attrs", gameState.inner.attrs);
}

module.exports = { test }
