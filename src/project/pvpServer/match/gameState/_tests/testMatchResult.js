const { ObjectId } = require("mongodb");

const gameBuild = { 
	_id: ObjectId(),
	version: 1,
	content: {
		web: {
			gameAttributes: {
				1: {
					code: 'player1Score'
				},
				2: {
					code: 'player2Score'
				},
				3: {
					code: 'player1Dead'
				},
				4: {
					code: 'player2Dead'
				},
			},
			gameSettings: {
				leaveGameCommandId: 6,
				gameOverCondition: {
					lib: 'condition',
					func: 'or',
					params: {
						cond1: {
							lib: 'condition',
							func: 'gt',
							params: {
								value1: {
									lib: 'value',
									func: 'game_attr',
									params: {
										attr_name: 'player1Dead'
									}
								},
								value2: {
									lib: 'value',
									func: 'const',
									params: {
										value: 0
									}
								}
							}
						},
						cond2: {
							lib: 'condition',
							func: 'gt',
							params: {
								value1: {
									lib: 'value',
									func: 'game_attr',
									params: {
										attr_name: 'player2Dead'
									}
								},
								value2: {
									lib: 'value',
									func: 'const',
									params: {
										value: 0
									}
								}
							}
						}
					}
				}
			},
			commands: {
				5: {
					name: 'Add Score',
					action: {
						lib: 'action',
						func: 'if_then',
						params: {
							if: {
								lib: 'condition',
								func: 'eq',
								params: {
									value2: {
										lib: 'value',
										func: 'scope_var',
										params: {
											var_name: 'player_index'
										}
									},
									value1: {
										lib: 'value',
										func: 'const',
										params: {
											value: 1
										}
									}
								}
							},
							then: {
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'player1Score',
									value: {
										lib: 'value',
										func: 'add',
										params: {
											value1: {
												lib: 'value',
												func: 'game_attr',
												params: {
													attr_name: 'player1Score'
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
							},
							else: {
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'player2Score',
									value: {
										lib: 'value',
										func: 'add',
										params: {
											value1: {
												lib: 'value',
												func: 'game_attr',
												params: {
													attr_name: 'player2Score'
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
				6: {
					name: 'Surrender',
					action: {
						lib: 'action',
						func: 'if_then',
						params: {
							if: {
								lib: 'condition',
								func: 'eq',
								params: {
									value2: {
										lib: 'value',
										func: 'scope_var',
										params: {
											var_name: 'player_index'
										}
									},
									value1: {
										lib: 'value',
										func: 'const',
										params: {
											value: 1
										}
									}
								}
							},
							then: {
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'player1Dead',
									value: {
										lib: 'value',
										func: 'const',
										params: {
											value: 1,
										}
									}
								}
							},
							else: {
								lib: 'action',
								func: 'set_game_attr',
								params: {
									attr_name: 'player2Dead',
									value: {
										lib: 'value',
										func: 'const',
										params: {
											value: 1,
										}
									}
								}
							}
						}
					}
				}
			},
			players: {
				7: {
					index: 1,
					score: {
						lib: 'value',
						func: 'game_attr',
						params: {
							attr_name: 'player1Score'
						}
					}
				},
				8: {
					index: 2,
					score: {
						lib: 'value',
						func: 'game_attr',
						params: {
							attr_name: 'player2Score'
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
	player1.execAllMixins('onSocketRequestAction', {
		type: 'gameCommand',
		commandId: 5,
		ctx: {
			object_id: 5,
		}
	});
	player1.execAllMixins('onSocketRequestAction', {
		type: 'gameCommand',
		commandId: 5,
		ctx: {
			object_id: 5,
		}
	})
	player2.execAllMixins('onSocketRequestAction', {
		type: 'gameCommand',
		commandId: 5,
		ctx: {
			object_id: 5,
		}
	})
	player2.execAllMixins('onSocketRequestAction', {
		type: 'gameCommand',
		commandId: 5,
		ctx: {
			object_id: 5,
		}
	})
	player2.execAllMixins('onSocketRequestAction', {
		type: 'gameCommand',
		commandId: 5,
		ctx: {
			object_id: 5,
		}
	})
	player1.execAllMixins('onSocketRequestLeaveMatch');
	assert(!project.get(Match, match.id))
	let playerScore = objget(match.result.playerScore);
	assert(playerScore);
	assert(playerScore['1'] === 2);
	assert(playerScore['2'] === 3);
}

module.exports = { test }
