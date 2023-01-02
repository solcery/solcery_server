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
	let obj5 = match.gameState.entities['5'];
	assert(obj5.id === 5);
	assert(obj5.attrs.place === 4);
	assert(obj5.attrs.testObjectAttr === 3);
	let obj8 = match.gameState.entities['8'];
	assert(obj8.id === 8);
	assert(obj8.attrs.place === 4);
	assert(obj8.attrs.testObjectAttr === 1);
}

module.exports = { test }
