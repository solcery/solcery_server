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
	constructor(game) {
		this.game = game;
		this.gameState = game.gameState;
		assert(this.gameState);
		this.gameAttrs = game.gameState.inner.attrs;
	}

	getPlayerIndex(player) {
		let playerData = this.game.players.find(p => p.id === player.id);
		return playerData.index;
	}

	getClickCommand(entity) {
		return {
			commandId: LEFT_CLICK, 
			scopeVars: { object_id: entity.id }
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

	click(player, object) {
		if (this.gameFinished()) return;
		player.execAllMixins('onWSRequestAction', { 
			action: this.getClickCommand(object), 
		});
	}

	/* choose random hero */
	chooseHero(player, heroNumber = 0) {
		let playerIndex = this.getPlayerIndex(player);
		assert(this.gameAttrs.game_mode === 0);
		
		let menuCards = undefined;
		let menuConfirm = undefined;

		if (playerIndex === 1) {
			menuConfirm = this.getEntity(MENU_CONFIRM_P1);
			menuCards = [
				this.getEntity(MENU_CARDS_P1[0]),
				this.getEntity(MENU_CARDS_P1[1]),
				this.getEntity(MENU_CARDS_P1[2]),
			]
		} else {
			menuConfirm = this.getEntity(MENU_CONFIRM_P2);
			menuCards = [
				this.getEntity(MENU_CARDS_P2[0]),
				this.getEntity(MENU_CARDS_P2[1]),
				this.getEntity(MENU_CARDS_P2[2]),
			]
		}

		let card = undefined;
		if (heroNumber > 0) {
			card = menuCards[heroNumber];
		} else {
			card = menuCards[getRandomInt(3)];
		}
		this.click(player, card);
		this.click(player, menuConfirm);
	}

	endTurn(player) {
		if (this.gameFinished()) return;
		let playerIndex = this.getPlayerIndex(player);
		assert(this.gameAttrs.current_player === playerIndex);
		assert(this.gameAttrs.game_mode === 1);

		let endTurnButton = this.getEntity(END_TURN_BUTTON);
		let endTurnConfirmButton = this.getEntity(END_TURN_CONFIRM_BUTTON);

		this.click(player, endTurnButton);
		if (this.gameAttrs.show_notif === 1) {
			this.click(player, endTurnConfirmButton);
		}

		assert(this.gameAttrs.current_player != playerIndex);
	}

	getPlayerHand(player) {
		let cards;
		if (this.getPlayerIndex(player) === 1)  {
			cards = this.getEntities(GAME_HAND_P1);
		} else {
			cards = this.getEntities(GAME_HAND_P2);
		}
		shuffleArray(cards);
		return cards;
	}

	getPlayerGold(player) {
		if (this.getPlayerIndex(player) === 1) {
			return this.gameAttrs.your_gold;
		} else {
			return this.gameAttrs.enemy_gold;
		}
	}

	/* get list of shop cards that player can buy */
	getShopCards(player) {
		let cards = [];
		let playerGold = this.getPlayerGold(player);
		for (let place of SHOP_CARDS) {
			let entity = this.getEntity(place);
			if (entity) {
				let price = entity.attrs.duration; 
				if (price <= playerGold) {
				cards.push(entity);
				}
			}
		}
		shuffleArray(cards);
		return cards;
	}

	gameFinished() {
		return this.gameAttrs.game_mode === 2;
	}

	/* use full hand in random order */
	useHand(player) {
		if (this.gameFinished()) return;
		let playerIndex = this.getPlayerIndex(player);
		assert(this.gameAttrs.current_player === playerIndex);
		assert(this.gameAttrs.game_mode === 1);

		let usedCards = 0;

		let playerHand = this.getPlayerHand(player);
		while(playerHand.length > 0 && !this.gameFinished()) {
			let card = playerHand[getRandomInt(playerHand.length)];
			this.click(player, card);
			usedCards += 1;
			playerHand = this.getPlayerHand(player);
		}

		console.log("player", playerIndex);
		console.log("  used " + usedCards + " cards");
		console.log("  P1 HP: " + this.gameAttrs.your_hp + " P2 HP: " + this.gameAttrs.enemy_hp + " GOLD: " + this.getPlayerGold(player));
	}

	useShop(player) {
		if (this.gameFinished()) return;
		let playerIndex = this.getPlayerIndex(player);
		assert(this.gameAttrs.current_player === playerIndex);
		assert(this.gameAttrs.game_mode === 1);

		let shopedCards = 0;

		let shopCards = this.getShopCards(player);
		while(shopCards.length > 0 && !this.gameFinished()) {
			let card = shopCards[getRandomInt(shopCards.length)];
			this.click(player, card);
			shopedCards += 1;
			shopCards = this.getShopCards(player);
		}
		if (shopedCards > 0) {
			console.log("  shop " + shopedCards + " cards");
		}
	}
}

module.exports = { SummonerInteractor };