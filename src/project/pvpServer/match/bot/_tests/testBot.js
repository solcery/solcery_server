const { ObjectId } = require("mongodb");


const gameBuild = { 
	_id: ObjectId(),
	version: 1,
	content: {
		web: {
			gameAttributes: {
				1: {
					code: 'activePlayer'
				},
				2: {
					code: 'turnNumber'
				},
				3: {
					code: 'testAttr'
				}
			},
			attributes: {
				4: {
					code: 'testObjectAttr'
				},
				5: {
					code: 'place'
				}
			},
			gameSettings: {
				initAction: {
					lib: 'action',
					func: 'two',
					params: {
						action1: {
							lib: 'action',
							func: 'set_game_attr',
							params: {
								attr_name: 'activePlayer',
								value: {
									lib: 'value',
									func: 'const',
									params: {
										value: 1
									}
								}
							}
						},
						action2: {
							lib: 'action',
							func: 'set_game_attr',
							params: {
								attr_name: 'turnNumber',
								value: {
									lib: 'value',
									func: 'const',
									params: {
										value: 1
									}
								}
							}
						}
					}
				},
				layout: [ 'testLayout' ],
			},
			cards: {
				6: {
					preset: 'testLayout',
					place: 1,
					cards: [
						{
							cardType: 7,
							amount: 1,
						}
					]
				},
				60: {
					preset: 'testLayout',
					place: 1,
					cards: [
						{
							cardType: 8,
							amount: 1,
						}
					]
				}
			},
			cardTypes: {
				7: {
					action_on_use: {
						lib: 'action',
						func: 'two',
						params: {
							action1: { // change active player
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'activePlayer',
									value: {
										lib: 'value',
										func: 'sub',
										params: {
											value1: {
												lib: 'value',
												func: 'const',
												params: {
													value: 3
												}
											},
											value2: {
												lib: 'value',
												func: 'game_attr',
												params: {
													attr_name: 'activePlayer',
												}
											}
										}
									}
								}
							},
							action2: {
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'turnNumber',
									value: {
										lib: 'value',
										func: 'add',
										params: {
											value1: {
												lib: 'value',
												func: 'game_attr',
												params: {
													attr_name: 'turnNumber',
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
					}
				},
				8: {
					action_on_use: {
						lib: 'action',
						func: 'two',
						params: {
							action1: { // take card
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'testAttr',
									value: {
										lib: 'value',
										func: 'add',
										params: {
											value1: {
												lib: 'value',
												func: 'game_attr',
												params: {
													attr_name: 'testAttr',
												}
											},
											value2: {
												lib: 'value',
												func: 'game_attr',
												params: {
													attr_name: 'turnNumber',
												}
											},
										}
									}
								}
							},
							action2: {
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'turnNumber',
									value: {
										lib: 'value',
										func: 'add',
										params: {
											value1: {
												lib: 'value',
												func: 'game_attr',
												params: {
													attr_name: 'turnNumber',
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
					}
				}
			},
			commands: { // USE CARD
				9: {
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
		},

		bot: {
			players: {
				10: {
					index: 1,
					bots: [ 12 ]
				},
				11: {
					index: 2,
					bots: [ 13 ]
				}
			},
			bots: {
				12: {
					scopeVars: [
						{
							varName: 'player_index',
							value: 1,
						},
						{
							varName: 'take_card_turn',
							value: 5,
						}
					],
					activationCondition: {
						lib: 'condition',
						func: 'and',
						params: {
							cond1: {
								lib: 'condition',
								func: 'lt',
								params: {
									value1: {
										lib: 'value',
										func: 'game_attr',
										params: {
											attr_name: 'turnNumber'
										}
									},
									value2: {
										lib: 'value',
										func: 'const',
										params: {
											value: 10
										}
									}
								}
							},
							cond2: {
								lib: 'condition',
								func: 'eq',
								params: {
									value1: {
										lib: 'value',
										func: 'game_attr',
										params: {
											attr_name: 'activePlayer'
										}
									},
									value2: {
										lib: 'value',
										func: 'scope_var',
										params: {
											var_name: 'player_index'
										}
									}
								}
							}
						}
					},
					rules: [ 14, 15 ]
				},
				13: {
					scopeVars: [
						{
							varName: 'player_index',
							value: 2,
						},
						{
							varName: 'take_card_turn',
							value: 9,
						}
					],
					activationCondition: {
						lib: 'condition',
						func: 'and',
						params: {
							cond1: {
								lib: 'condition',
								func: 'lt',
								params: {
									value1: {
										lib: 'value',
										func: 'game_attr',
										params: {
											attr_name: 'turnNumber'
										}
									},
									value2: {
										lib: 'value',
										func: 'const',
										params: {
											value: 10
										}
									}
								}
							},
							cond2: {
								lib: 'condition',
								func: 'eq',
								params: {
									value1: {
										lib: 'value',
										func: 'game_attr',
										params: {
											attr_name: 'activePlayer'
										}
									},
									value2: {
										lib: 'value',
										func: 'scope_var',
										params: {
											var_name: 'player_index'
										}
									}
								}
							}
						}
						
					},
					rules: [ 14, 15 ]
				}
			},
			botRules: {
				14: {
					name: 'end turn',
					condition: {
						lib: 'condition',
						func: 'not',
						params: {
							condition: {
								lib: 'condition',
								func: 'eq',
								params: {
									value1: {
										lib: 'value',
										func: 'game_attr',
										params: { 
											attr_name: 'turnNumber'
										}
									},
									value2: {
										lib: 'value',
										func: 'scope_var',
										params: { 
											var_name: 'take_card_turn'
										}
									}
								}
							}
						}
					},
					weight: {
						lib: 'value',
						func: 'const',
						params: {
							value: 1
						}
					},
					action: {
						lib: 'action',
						func: 'command',
						params: {
							command_id: 9,
							object_id: {
								lib: 'value',
								func: 'const',
								params: {
									value: 1,
								}
							}
						}
					}
				},
				15: {
					name: 'take card',
						condition: {
						lib: 'condition',
						func: 'eq',
						params: {
							value1: {
								lib: 'value',
								func: 'game_attr',
								params: { 
									attr_name: 'turnNumber'
								}
							},
							value2: {
								lib: 'value',
								func: 'scope_var',
								params: { 
									var_name: 'take_card_turn'
								}
							}
						}
					},
					weight: {
						lib: 'value',
						func: 'const',
						params: {
							value: 1
						}
					},
					action: {
						lib: 'action',
						func: 'command',
						params: {
							command_id: 9,
							object_id: {
								lib: 'value',
								func: 'const',
								params: {
									value: 2,
								}
							}
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
	let player1 = project.createBot();
	let player2 = project.createBot();
	match.addPlayer(player1);
	match.addPlayer(player2);
	match.start();

	assert(match.gameState.attrs.testAttr === 14);
	assert(match.gameState.attrs.turnNumber === 10);
	assert(match.gameState.attrs.activePlayer === 2);
}

module.exports = { test }
