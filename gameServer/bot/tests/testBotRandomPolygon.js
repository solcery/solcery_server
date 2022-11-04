const { json } = require("express/lib/response");

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


const LEFT_CLICK = 418;

const MENU_CARDS_P1 = [51, 52, 53];
const MENU_CARDS_P2 = [71, 72, 73];
const MENU_CONFIRM_P1 = 54;
const MENU_CONFIRM_P2 = 504;

const GAME_HAND_P1 = 2;
const GAME_HAND_P2 = 5;

const END_TURN_BUTTON = 90;
const END_TURN_CONFIRM_BUTTON = 111;

const SHOP_CARDS = [37, 38, 39, 40, 41]


class SummonerInteractor {
	constructor(gameState) {
		this.gameState = gameState;
		assert(this.gameState);
		this.gameAttrs = gameState.inner.attrs;
	}

	// getPlayerIndex(player) {
	// 	let playerData = this.game.players.find(p => p.id === player.id);
	// 	return playerData.index;
	// }

	getClickCommand(entity, logMessage = undefined) {
		return {
			commandId: LEFT_CLICK, 
			ctx: { object_id: entity.id },
			logMessage: logMessage,
		}
	}

	getEntity(place) {
		for (let object of Object.values(this.gameState.inner.objects)) {
			if (object.attrs.place === place) {
				return object;
			}
		}
	}

	getEntities(place) {
		let objects = [];
		for (let object of Object.values(this.gameState.inner.objects)) {
			if (object.attrs.place === place) {
				objects.push(object);
			}
		}
		return objects;
	}

	getMenuComfirmButton(player_index) {
		if (player_index === 1) {
			return this.getEntity(MENU_CONFIRM_P1);
		} else {
			return this.getEntity(MENU_CONFIRM_P2);
		}
	}

	getMenuCards(player_index) {
		let menuCards;
		if (player_index === 1) {
			menuCards = [
				this.getEntity(MENU_CARDS_P1[0]),
				this.getEntity(MENU_CARDS_P1[1]),
				this.getEntity(MENU_CARDS_P1[2]),
			]
		} else {
			menuCards = [
				this.getEntity(MENU_CARDS_P2[0]),
				this.getEntity(MENU_CARDS_P2[1]),
				this.getEntity(MENU_CARDS_P2[2]),
			]
		}
		return menuCards;
	}

	getClickCommands(cards) {
		let commands = [];
		for (let card of cards) {
			commands.push(this.getClickCommand(card));
		}
		return commands;
	}
	
	getPlayerHand(player_index) {
		let cards;
		if (player_index === 1)  {
			cards = this.getEntities(GAME_HAND_P1);
		} else {
			cards = this.getEntities(GAME_HAND_P2);
		}
		return cards;
	}

	getPlayerGold(player_index) {
		if (player_index === 1) {
			return this.gameAttrs.your_gold;
		} else {
			return this.gameAttrs.enemy_gold;
		}
	}

	/* get list of shop cards that player can buy */
	getShopCards(player_index) {
		let cards = [];
		let playerGold = this.getPlayerGold(player_index);
		for (let place of SHOP_CARDS) {
			let entity = this.getEntity(place);
			if (entity) {
				let price = entity.attrs.duration; 
				if (price <= playerGold) {
				cards.push(entity);
				}
			}
		}
		return cards;
	}

	gameFinished() {
		return this.gameAttrs.game_mode === 2;
	}
}


async function test(testEnv) {
	const core = await createCore();

	const SERVER_NAME = 'testGameSrv';
	const GAME_NAME = 'game_polygon'
	const PUBKEY1 = 'botPlayerOne';
	const PUBKEY2 = 'botPlayerTwo';

	await core.create(GameServer, { 
		id: SERVER_NAME, 
		gameId: GAME_NAME,
		db: GAME_NAME,
	});

	let gameServer = core.get(GameServer, SERVER_NAME);
	assert(gameServer);

	await sleep(1000); 	

	let mongo = await gameServer.get(Mongo, "main");
	const max_attempts = 20; // one sec is not enough, sometimes even 10 secs are not enough :(
	for (let attempts = 0; attempts < max_attempts; attempts++) {
		if (mongo.versions) {
			break;
		}
		await sleep(1000);
		mongo = await gameServer.get(Mongo, 'main');
	} 
	assert(mongo.versions, "failed to get a game from mongo db")
    let version = await mongo.versions.count();
	let gameVersion = await mongo.versions.findOne({ version });
	let content = gameVersion.content.web;

	let game = await gameServer.createGame();
	let gameState = game.create(GameState, {content: content, seed: 0 });
    game.gameState = gameState;

	let nft_choosen = [false, false, false];

	let possibleCommands = function(gameState, player_index) {
		let summonerInteractor = new SummonerInteractor(gameState);
		let gameAttrs = summonerInteractor.gameAttrs;

		let commands = [];

		/* MENU */

		let msgChoose = "player " + player_index + " choose NFT";
		let msgConfirm = "player " + player_index + " ready"

		if (gameAttrs.game_mode === 0) {
			if (gameAttrs.show_nfts_screen === 3) {
				if (gameAttrs.nfts_ready_to_lay === 2 || nft_choosen[player_index]) {
					let menuConfirm = summonerInteractor.getMenuComfirmButton(player_index); 
					commands.push(summonerInteractor.getClickCommand(menuConfirm, msgConfirm))
				} else {
					let cards = summonerInteractor.getMenuCards(player_index);
					for (let card of cards) {
						commands.push(summonerInteractor.getClickCommand(card, msgChoose));
					}
					nft_choosen[player_index] = true;
				}
			} else if (gameAttrs.show_nfts_screen === player_index) {
				if (gameAttrs.nfts_ready_to_lay === 2) {
					let menuConfirm = summonerInteractor.getMenuComfirmButton(player_index); 
					commands.push(summonerInteractor.getClickCommand(menuConfirm, msgConfirm))
				} else {
					let cards = summonerInteractor.getMenuCards(player_index);
					for (let card of cards) {
						commands.push(summonerInteractor.getClickCommand(card, msgChoose));
					}
					nft_choosen[player_index] = true;
				}
			} else {
			}			
		}

		/* GAME */

		if (gameAttrs.game_mode === 1 && gameAttrs.current_player === player_index) {
			let cards = summonerInteractor.getPlayerHand(player_index);
			for (let card of cards) {
				let msg = "player " + player_index + " use a card";
				commands.push(summonerInteractor.getClickCommand(card, msg));
			}

			cards = summonerInteractor.getShopCards(player_index); 
			for (let card of cards) {
				let msg = "player " + player_index + " buy a card";
				commands.push(summonerInteractor.getClickCommand(card, msg));
			}

			if (commands.length === 0) {
				let endTurnButton = summonerInteractor.getEntity(END_TURN_BUTTON);
				msgEndTurn = "end turn P1 HP: " + gameAttrs.your_hp + " P2 HP: " + gameAttrs.enemy_hp + " GOLD: " + summonerInteractor.getPlayerGold(player_index);
				commands.push(summonerInteractor.getClickCommand(endTurnButton, msgEndTurn));
			} 
		}

		return commands;
	}

	let botPlayerOne = await gameServer.create(Player, { 
		id: PUBKEY1, 
		pubkey: PUBKEY1,
        bot: true,
        algorithm: 'random',
		possibleCommands: possibleCommands,
	});
	let botPlayerTwo = await gameServer.create(Player, { 
		id: PUBKEY2, 
		pubkey: PUBKEY2, 
        bot: true,
        algorithm: 'random',
		possibleCommands: possibleCommands,
	});

	await game.addPlayer(botPlayerOne);
	await game.addPlayer(botPlayerTwo);
	await game.start();

	assert(gameState.inner.attrs.game_mode === 2);
	console.log(gameState.inner.attrs);
}

module.exports = { test }