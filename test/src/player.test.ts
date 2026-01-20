import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { Player } from "@Game/player.ts";
import {
	Ability,
	Class,
	Event,
	EventListenerMessage,
	GamePlayCardReturn,
	Location,
	QuestType,
	Rarity,
	Rune,
	SpellSchool,
	Tag,
	type Target,
	Type,
} from "@Game/types.ts";
import { describe, expect, test } from "bun:test";

/*
 * Need to create a game in case the functions need it.
 * This is a pretty big performance hit.
 */
await createGame();

describe("src/player", () => {
	describe("static", () => {
		test("fromID", async () => {
			expect(Player.fromID(0)).toEqual(game.player1);
			expect(Player.fromID(1)).toEqual(game.player2);
			// This is so that Player.fromID always returns Player instead of Player | undefined
			expect(Player.fromID(2)).toEqual(game.player2);
		});
	});

	test("getName", async () => {
		expect(game.player1.getName()).toEqual("Player 1");
		expect(game.player2.getName()).toEqual("Player 2");

		game.player1.id = 1;
		game.player2.id = 0;

		expect(game.player1.getName()).toEqual("Player 2");
		expect(game.player2.getName()).toEqual("Player 1");

		game.player1.id = 0;
		game.player2.id = 1;
	});

	test("getOpponent", async () => {
		expect(game.player1.getOpponent()).toEqual(game.player2);
		expect(game.player2.getOpponent()).toEqual(game.player1);
	});

	test("refreshMana", async () => {
		const player = new Player();
		expect(player.mana).toBe(0);

		expect(player.refreshMana(10)).toBe(true);
		expect(player.mana).toBe(0);
		expect(player.emptyMana).toBe(0);

		player.mana = 0;

		expect(player.refreshMana(5, player.maxMana)).toBe(false);
		expect(player.mana).toBe(5);
		expect(player.emptyMana).toBe(0);

		player.mana = 0;
		player.emptyMana = 10;

		expect(player.refreshMana(10)).toBe(false);
		expect(player.mana).toBe(10);

		player.mana = 5;

		expect(player.refreshMana(10)).toBe(true);
		expect(player.mana).toBe(10);
	});

	test("addEmptyMana", async () => {
		const player = new Player();

		expect(player.emptyMana).toBe(0);

		expect(player.addEmptyMana(1)).toBe(false);
		expect(player.emptyMana).toBe(1);

		expect(player.addEmptyMana(5)).toBe(false);
		expect(player.emptyMana).toBe(6);

		expect(player.addEmptyMana(9)).toBe(true);
		expect(player.emptyMana).toBe(10);
	});

	test("addMana", async () => {
		const player = new Player();

		expect(player.mana).toBe(0);
		expect(player.emptyMana).toBe(0);

		expect(player.addMana(2)).toBe(false);
		expect(player.mana).toBe(2);
		expect(player.emptyMana).toBe(2);

		expect(player.addMana(5)).toBe(false);
		expect(player.mana).toBe(7);
		expect(player.emptyMana).toBe(7);

		expect(player.addMana(5)).toBe(true);
		expect(player.mana).toBe(10);
		expect(player.emptyMana).toBe(10);

		player.mana = 2;

		expect(player.addMana(5)).toBe(true);
		expect(player.mana).toBe(7);
		expect(player.emptyMana).toBe(10);

		player.emptyMana = 2;

		expect(player.addMana(5)).toBe(true);
		expect(player.mana).toBe(10);
		expect(player.emptyMana).toBe(7);
	});

	test("addOverload", async () => {
		const player = new Player();

		game.event.addListener(Event.GainOverload, async (value, eventPlayer) => {
			expect(eventPlayer).toBe(player);
			expect(value).toBe(1);
			return EventListenerMessage.Destroy;
		});

		expect(player.overload).toBe(0);
		await player.addOverload(1);

		expect(player.overload).toBe(1);
	});

	test("setWeapon", async () => {
		const player = new Player();

		let deathrattleTriggered = false;

		expect(player.weapon).toBeUndefined();

		const weapon = await Card.create(
			game.cardIds.wickedKnife_019bc665_4f81_700c_9393_55d79a04e156,
			player,
		);
		weapon.addAbility(Ability.Deathrattle, async (self, owner) => {
			deathrattleTriggered = true;
		});

		expect(await player.setWeapon(weapon)).toBe(true);

		expect(player.weapon).not.toBeUndefined();
		expect(player.attack).toBe(weapon.attack!);

		expect(deathrattleTriggered).toBe(false);

		const weapon2 = await weapon.imperfectCopy();
		weapon2.attack = 5;

		expect(await player.setWeapon(weapon2)).toBe(true);

		expect(player.weapon).not.toBeUndefined();
		expect(player.attack).toBe(5);

		expect(deathrattleTriggered).toBe(true);
	});

	test("destroyWeapon", async () => {
		const player = new Player();

		let deathrattleTriggered = false;

		expect(player.weapon).toBeUndefined();
		expect(await player.destroyWeapon()).toBe(false);

		const weapon = await Card.create(
			game.cardIds.wickedKnife_019bc665_4f81_700c_9393_55d79a04e156,
			player,
		);
		weapon.addAbility(Ability.Deathrattle, async (self, owner) => {
			deathrattleTriggered = true;
		});

		expect(await player.setWeapon(weapon)).toBe(true);

		expect(player.weapon).not.toBeUndefined();
		expect(player.attack).toBe(weapon.attack!);

		expect(await player.destroyWeapon()).toBe(true);
		expect(player.weapon).toBeUndefined();
		expect(player.attack).toBe(0);

		expect(deathrattleTriggered).toBe(true);
	});

	test("addArmor", async () => {
		const player = new Player();
		expect(player.armor).toBe(0);

		expect(player.addArmor(1)).toBe(true);
		expect(player.armor).toBe(1);

		expect(player.addArmor(4)).toBe(true);
		expect(player.armor).toBe(5);

		expect(player.addArmor(100)).toBe(true);
		expect(player.armor).toBe(105);
	});

	test("addAttack", async () => {
		const player = new Player();

		game.event.addListener(Event.GainHeroAttack, async (value, eventPlayer) => {
			expect(eventPlayer).toBe(player);
			expect(value).toBe(1);
			return EventListenerMessage.Destroy;
		});

		expect(player.attack).toBe(0);
		await player.addAttack(1);

		expect(player.attack).toBe(1);
	});

	test("addHealth", async () => {
		const player = new Player();
		expect(player.health).toBe(player.maxHealth);

		player.addHealth(1);
		expect(player.health).toBe(player.maxHealth);

		player.health = player.maxHealth - 10;
		player.addHealth(1);
		expect(player.health).toBe(player.maxHealth - 10 + 1);
	});

	test("damage", async () => {
		// TODO: Fix
		const player = new Player();
		// let times = 0;
		// let fatalDamageTriggered = false;

		const destroy = game.event.addListener(
			Event.TakeDamage,
			async (value, eventPlayer) => {
				expect(value).toBe(1);
				// times++;
				return EventListenerMessage.Success;
			},
			-1,
		);

		// game.event.addListener(Event.FatalDamage, async (value, eventPlayer) => {
		// 	expect(value).toBeUndefined();
		// 	fatalDamageTriggered = true;
		// 	player.health = 1;
		// 	return EventListenerMessage.Destroy;
		// });

		expect(player.health).toBe(player.maxHealth);
		expect(player.armor).toBe(0);
		expect(await player.damage(1)).toBe(true);

		expect(player.health).toBe(player.maxHealth - 1);
		// TODO: This fails for some reason.
		// expect(times).toBe(1);

		player.armor = 5;
		expect(await player.damage(3)).toBe(true);

		expect(player.health).toBe(player.maxHealth - 1);
		expect(player.armor).toBe(2);
		// expect(times).toBe(1);

		expect(await player.damage(3)).toBe(true);

		expect(player.health).toBe(player.maxHealth - 2);
		expect(player.armor).toBe(0);
		// expect(times).toBe(2);

		// expect(await player.damage(9999)).toBe(true);
		// expect(player.health).toBe(1);
		// expect(times).toBe(3);
		// expect(fatalDamageTriggered).toBe(true);

		player.health = player.maxHealth;
		player.immune = true;

		expect(await player.damage(1)).toBe(true);
		expect(player.health).toBe(player.maxHealth);

		destroy();
	});

	test("addToDeck", async () => {
		const player = new Player();
		expect(player.deck.length).toBe(0);

		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		await player.addToDeck(sheep);

		expect(player.deck.length).toBe(1);
		expect(player.deck[0]).toBe(sheep);

		const sheep2 = await sheep.imperfectCopy();
		await player.addToDeck(sheep2);

		expect(player.deck.length).toBe(2);
		expect(player.deck[1]).toBe(sheep2);

		const sheep3 = await sheep.imperfectCopy();
		await player.addToDeck(sheep3, 1);

		expect(player.deck.length).toBe(3);
		expect(player.deck[0]).toBe(sheep);
		expect(player.deck[1]).toBe(sheep3);
		expect(player.deck[2]).toBe(sheep2);
	});

	test("shuffleDeck", async () => {
		const player = new Player();
		expect(player.deck.length).toBe(0);

		// Add 10 Sheep to the deck.
		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		for (let i = 0; i < 10; i++) {
			const sheepCopy = await sheep.imperfectCopy();
			sheepCopy.name = i.toString();

			await player.addToDeck(sheepCopy);
		}

		expect(player.deck.length).toBe(10);
		player.shuffleDeck();

		expect(
			player.deck.toSorted((a, b) => a.name.localeCompare(b.name)),
		).not.toEqual(player.deck);
	});

	test("shuffleIntoDeck", async () => {
		const player = new Player();
		expect(player.deck.length).toBe(0);

		// Add 10 Sheep to the deck.
		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		for (let i = 0; i < 10; i++) {
			const sheepCopy = await sheep.imperfectCopy();
			sheepCopy.name = i.toString();

			await player.addToDeck(sheepCopy);
		}

		expect(player.deck.length).toBe(10);
		expect(await player.shuffleIntoDeck(sheep)).toBe(true);

		// Make sure that the shuffling places the card somewhere in the middle.
		let attempts = 0;
		const maxAttempts = 10;

		while (
			(player.deck.indexOf(sheep) <= 0 ||
				player.deck.indexOf(sheep) >= player.deck.length) &&
			attempts < maxAttempts
		) {
			attempts++;
			game.functions.util.remove(player.deck, sheep);
			expect(await player.shuffleIntoDeck(sheep)).toBe(true);
		}

		expect(attempts).toBeLessThanOrEqual(maxAttempts);

		expect(player.deck.indexOf(sheep)).toBeGreaterThan(0);
		expect(player.deck.indexOf(sheep)).toBeLessThan(player.deck.length);
	});

	test("addToBottomOfDeck", async () => {
		const player = new Player();

		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		await player.addToDeck(sheep);

		const sheep2 = await sheep.imperfectCopy();
		expect(await player.addToBottomOfDeck(sheep2)).toBe(true);

		expect(player.deck.length).toBe(2);
		expect(player.deck[0]).toBe(sheep2);
		expect(player.deck[1]).toBe(sheep);
	});

	test("drawCards", async () => {
		const player = new Player();
		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);

		// Add 10 Sheep to the deck.
		for (let i = 0; i < 10; i++) {
			const sheepCopy = await sheep.imperfectCopy();
			sheepCopy.name = i.toString();

			await player.addToDeck(sheepCopy);
		}

		const toDraw = game.lodash.last(player.deck);
		expect(toDraw).toBeDefined();
		if (!toDraw) {
			return;
		}

		expect(await player.drawCards(1)).toContain(toDraw);
		expect(player.hand.length).toBe(1);
		expect(player.hand[0]).toBe(toDraw);

		const toDraw1 = game.lodash.last(player.deck);
		const toDraw2 = game.lodash.nth(player.deck, -2);
		expect(toDraw1).toBeDefined();
		expect(toDraw2).toBeDefined();
		if (!toDraw1 || !toDraw2) {
			return;
		}

		const drawn = await player.drawCards(2);
		expect(drawn.length).toBe(2);
		expect(drawn).toContain(toDraw1);
		expect(drawn).toContain(toDraw2);

		expect(player.hand.length).toBe(3);
		expect(player.hand[0]).toBe(toDraw);
		expect(player.hand[1]).toBe(toDraw1);
		expect(player.hand[2]).toBe(toDraw2);
	});

	test("drawSpecific", async () => {
		const player = new Player();
		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);

		// Add 10 Sheep to the deck.
		for (let i = 0; i < 10; i++) {
			const sheepCopy = await sheep.imperfectCopy();
			sheepCopy.name = i.toString();

			await player.addToDeck(sheepCopy);

			if (i === 5) {
				await player.addToDeck(sheep);
			}
		}

		expect(await player.drawSpecific(sheep)).toBe(sheep);
		expect(player.hand.length).toBe(1);
		expect(player.hand[0]).toBe(sheep);

		expect(await player.drawSpecific(sheep)).toBeUndefined();
		expect(player.hand.length).toBe(1);
	});

	test("addToHand", async () => {
		const player = new Player();

		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		expect(await player.addToHand(sheep)).toBe(true);
		expect(player.hand.length).toBe(1);
		expect(player.hand[0]).toBe(sheep);

		for (let i = 0; i < 10; i++) {
			// Keep being true until the player runs out of space in their hand.
			expect(await player.addToHand(sheep)).toBe(
				i < game.config.general.maxHandLength - 1,
			);
		}
	});

	test("popFromHand", async () => {
		const player = new Player();

		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		expect(await player.addToHand(sheep)).toBe(true);

		expect(await player.popFromHand()).toBe(sheep);
		expect(player.hand.length).toBe(0);

		const sheep1 = await sheep.imperfectCopy();
		const sheep2 = await sheep.imperfectCopy();
		expect(await player.addToHand(sheep1)).toBe(true);
		expect(await player.addToHand(sheep2)).toBe(true);

		expect(await player.popFromHand(0)).toBe(sheep1);
		expect(await player.popFromHand(0)).toBe(sheep2);
	});

	test("setHero", async () => {
		const player = new Player();

		const hero = await Card.create(
			game.cardIds.jainaProudmoore_019bc665_4f81_7022_8fb3_03df1993cdb1,
			player,
		);
		hero.armor = 5;

		expect(player.hero).not.toBe(hero);
		expect(player.armor).toBe(0);

		await player.setHero(hero);

		expect(player.hero).toBe(hero);
		expect(player.armor).toBe(5);
	});

	test("setToStartingHero", async () => {
		const player = new Player();

		const hero = await Card.create(
			game.cardIds.jainaProudmoore_019bc665_4f81_7022_8fb3_03df1993cdb1,
			player,
		);
		hero.id = game.cardIds.null;

		await player.setHero(hero);

		expect(player.hero).toBe(hero);
		expect(player.hero.id).toBe(game.cardIds.null);

		expect(await player.setToStartingHero()).toBe(true);

		expect(player.hero).not.toBe(hero);
		expect(player.hero.id).toBe(
			game.cardIds.jainaProudmoore_019bc665_4f81_7022_8fb3_03df1993cdb1,
		);
	});

	test("heroPower", async () => {
		const { player1: player, player2: opponent } = game;
		player.emptyMana = 10;
		player.mana = 10;

		game.player = player;
		game.opponent = opponent;

		await player.setToStartingHero();
		expect(player.hero.heropower?.id).toBe(
			game.cardIds.fireblast_019bc665_4f81_7021_a0e4_15625f88ce10,
		);
		expect(opponent.health).toBe(opponent.maxHealth);

		player.forceTarget = opponent;
		expect(await player.heroPower()).toBe(true);

		expect(opponent.health).toBe(opponent.maxHealth - 1);
		expect(await player.heroPower()).toBe(false);

		expect(opponent.health).toBe(opponent.maxHealth - 1);
		expect(player.mana).toBe(player.emptyMana - player.hero.heropower!.cost);

		// Reset to make future tests work. Kinda ugly, but whatever...
		player.hasUsedHeroPowerThisTurn = false;
	});

	test("(disable/enable)HeroPower", async () => {
		game.player.mana = 10;
		expect(game.player.canUseHeroPower()).toBeTrue();

		expect(game.player.disableHeroPower(game.player.id)).toBeTrue();
		expect(game.player.disableHeroPower(game.player.id)).toBeFalse();
		expect(game.player.canUseHeroPower()).toBeFalse();

		expect(
			game.player.enableHeroPower(game.player.getOpponent().id),
		).toBeFalse();
		expect(
			game.player.disableHeroPower(game.player.getOpponent().id),
		).toBeTrue();
		expect(
			game.player.enableHeroPower(game.player.getOpponent().id),
		).toBeTrue();
		expect(game.player.canUseHeroPower()).toBeFalse();

		expect(game.player.enableHeroPower(game.player.id)).toBeTrue();
		expect(game.player.canUseHeroPower()).toBeTrue();
	});

	test("tradeCorpses", async () => {
		const player = new Player();

		const func = (expected: boolean) => {
			let didCallback = false;

			expect(
				player.tradeCorpses(3, () => {
					didCallback = true;
				}),
			).toBe(expected);

			expect(didCallback).toBe(expected);
		};

		func(false);
		player.heroClass = Class.DeathKnight;
		func(false);
		player.heroClass = Class.Mage;
		player.corpses = 7;
		func(false);
		player.heroClass = Class.DeathKnight;
		func(true);
		func(true);
		func(false);
	});

	test("canUseCorpses", async () => {
		const player = new Player();

		expect(player.canUseCorpses()).toBe(false);
		player.heroClass = Class.DeathKnight;
		expect(player.canUseCorpses()).toBe(true);
	});

	test("canUseRunes", async () => {
		const player = new Player();

		expect(player.canUseRunes()).toBe(false);
		player.heroClass = Class.DeathKnight;
		expect(player.canUseRunes()).toBe(true);
	});

	test.todo("canActuallyAttack", async () => {});

	test("canBeAttacked", async () => {
		const player = new Player();

		expect(player.canBeAttacked()).toBe(true);
		player.immune = true;
		expect(player.canBeAttacked()).toBe(false);
	});

	test("canUseHeroPower", async () => {
		const player = new Player();
		player.hero = await Card.create(
			game.cardIds.jainaProudmoore_019bc665_4f81_7022_8fb3_03df1993cdb1,
			player,
		);

		expect(player.canUseHeroPower()).toBe(false);
		player.mana = 10;
		expect(player.canUseHeroPower()).toBe(true);
		player.hasUsedHeroPowerThisTurn = true;
		expect(player.canUseHeroPower()).toBe(false);
		player.hasUsedHeroPowerThisTurn = false;
		player.disableHeroPower(player.id);
		expect(player.canUseHeroPower()).toBe(false);
		player.enableHeroPower(player.id);
	});

	test("isAlive", async () => {
		const player = new Player();

		expect(player.isAlive()).toBe(true);
		player.health = 10;
		expect(player.isAlive()).toBe(true);
		player.health = 0;
		expect(player.isAlive()).toBe(false);
	});

	test("getRemainingBoardSpace", async () => {
		const player = new Player();

		expect(player.getRemainingBoardSpace()).toBe(
			game.config.general.maxBoardSpace,
		);

		for (let i = 0; i < 5; i++) {
			player.summon(
				await Card.create(
					game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
					player,
				),
			);
			expect(player.getRemainingBoardSpace()).toBe(
				game.config.general.maxBoardSpace - player.board.length,
			);
		}
	});

	test("getRemainingHandSpace", async () => {
		const player = new Player();

		expect(player.getRemainingHandSpace()).toBe(
			game.config.general.maxHandLength,
		);

		for (let i = 0; i < 5; i++) {
			player.addToHand(
				await Card.create(
					game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
					player,
				),
			);
			expect(player.getRemainingHandSpace()).toBe(
				game.config.general.maxHandLength - player.hand.length,
			);
		}
	});

	test("getPlayedCards", async () => {
		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			game.player,
		);

		expect(game.player.getPlayedCards()).not.toContain(sheep);
		expect(await game.play(sheep, game.player)).toEqual(
			GamePlayCardReturn.Success,
		);
		expect(game.player.getPlayedCards()).toContain(sheep);
	});

	test("testRunes", async () => {
		const player = new Player();
		player.runes = [Rune.Blood, Rune.Frost, Rune.Unholy];

		expect(player.testRunes([Rune.Blood, Rune.Frost, Rune.Unholy])).toBe(true);
		expect(player.testRunes([Rune.Blood, Rune.Frost])).toBe(true);
		expect(player.testRunes([Rune.Blood])).toBe(true);
		expect(player.testRunes([Rune.Blood, Rune.Unholy])).toBe(true);
		expect(player.testRunes([Rune.Frost, Rune.Unholy])).toBe(true);

		expect(player.testRunes([Rune.Blood, Rune.Blood, Rune.Unholy])).toBe(false);
		expect(player.testRunes([Rune.Blood, Rune.Frost, Rune.Frost])).toBe(false);
		expect(player.testRunes([Rune.Blood, Rune.Unholy, Rune.Unholy])).toBe(
			false,
		);
		expect(player.testRunes([Rune.Frost, Rune.Unholy, Rune.Frost])).toBe(false);
		expect(player.testRunes([Rune.Frost, Rune.Frost, Rune.Unholy])).toBe(false);
		expect(player.testRunes([Rune.Frost, Rune.Frost, Rune.Frost])).toBe(false);

		player.runes = [Rune.Blood, Rune.Blood, Rune.Unholy];

		expect(player.testRunes([Rune.Blood, Rune.Blood, Rune.Unholy])).toBe(true);
		expect(player.testRunes([Rune.Blood, Rune.Blood])).toBe(true);
		expect(player.testRunes([Rune.Blood])).toBe(true);
		expect(player.testRunes([Rune.Blood, Rune.Unholy])).toBe(true);
		expect(player.testRunes([Rune.Unholy, Rune.Blood])).toBe(true);
		expect(player.testRunes([Rune.Unholy])).toBe(true);

		expect(player.testRunes([Rune.Frost])).toBe(false);
		expect(player.testRunes([Rune.Frost, Rune.Unholy])).toBe(false);
		expect(player.testRunes([Rune.Unholy, Rune.Blood, Rune.Unholy])).toBe(
			false,
		);

		player.runes = [Rune.Blood, Rune.Blood, Rune.Blood];

		expect(player.testRunes([Rune.Blood, Rune.Blood, Rune.Blood])).toBe(true);
		expect(player.testRunes([Rune.Blood, Rune.Blood])).toBe(true);
		expect(player.testRunes([Rune.Blood])).toBe(true);

		expect(player.testRunes([Rune.Frost])).toBe(false);
		expect(player.testRunes([Rune.Frost, Rune.Unholy])).toBe(false);
		expect(player.testRunes([Rune.Unholy, Rune.Blood, Rune.Unholy])).toBe(
			false,
		);
		expect(player.testRunes([Rune.Unholy])).toBe(false);
	});

	test.todo("mulligan", async () => {});

	test("createJade", async () => {
		const player = new Player();

		for (let i = 0; i < 40; i++) {
			const jade = await player.createJade();

			expect(jade.attack).toBe(Math.min(i + 1, 30));
			expect(jade.health).toBe(Math.min(i + 1, 30));
			expect(jade.cost).toBe(Math.min(i + 1, 10));
		}
	});

	test("discard", async () => {
		const player = new Player();

		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		await player.addToHand(sheep);

		expect(player.hand.length).toBe(1);
		expect(sheep.location).toBe(Location.Hand);

		await player.discard(sheep);

		expect(player.hand.length).toBe(0);
		expect(sheep.location).toBe(Location.None);
	});

	test("doTargets", async () => {
		const player = new Player();

		for (let i = 0; i < 5; i++) {
			player.summon(
				await Card.create(
					game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
					player,
				),
			);
		}

		const targets: Target[] = [];
		expect(player.doTargets((target) => targets.push(target))).toBe(true);

		expect(targets.length).toBe(6);
		expect(targets[0]).toBe(player.board[0]);
		expect(targets[1]).toBe(player.board[1]);
		expect(targets[2]).toBe(player.board[2]);
		expect(targets[3]).toBe(player.board[3]);
		expect(targets[4]).toBe(player.board[4]);
		expect(targets[5]).toBe(player);
	});

	test("highlander", async () => {
		const player = new Player();

		const sheep = await Card.create(
			game.cardIds.sheep_019bc665_4f7f_7002_8cd4_7c81ad4e65c6,
			player,
		);
		await player.addToDeck(sheep);
		expect(player.highlander()).toBe(true);

		await player.addToDeck(await sheep.imperfectCopy());
		expect(player.highlander()).toBe(false);
	});

	test("progressQuest", async () => {
		const player = game.player1;
		player.mana = 1;

		game.blueprints.push({
			name: "Quest Test",
			text: "",
			cost: 1,
			type: Type.Spell,
			classes: [Class.Neutral],
			rarity: Rarity.Free,
			collectible: false,
			tags: [Tag.Quest],
			id: game.cardIds.null,

			spellSchools: [SpellSchool.None],

			async cast(self, owner) {
				await owner.addQuest(
					QuestType.Quest,
					self,
					Event.Dummy,
					3,
					async (value, done) => {
						if (value === self) {
							return EventListenerMessage.Skip;
						}

						return EventListenerMessage.Success;
					},
				);
			},
		});

		const card = await Card.create(game.cardIds.null, player);
		await game.play(card, player);

		expect(player.quests.length).toBe(1);
		expect(player.quests[0].progress).toEqual([0, 3]);

		expect(player.progressQuest(card.uuid, 1)).toBe(1);
		expect(player.quests[0].progress).toEqual([1, 3]);

		expect(player.progressQuest(card.uuid, 2)).toBe(3);
		expect(player.quests[0].progress).toEqual([3, 3]);

		expect(await game.event.broadcastDummy(player)).toBe(true);
		expect(player.quests.length).toBe(0);
	});

	test.todo("addQuest", async () => {});
	test.todo("invoke", async () => {});
	test.todo("recruit", async () => {});
	test.todo("joust", async () => {});
	test.todo("inputQueueNext", async () => {});

	// This is the same as `game.summon`.
	// test.todo("summon", async () => {});

	// This is the same as `game.attack`.
	// test.todo("attackTarget", async () => {});

	test.todo("spawnInDIYCard", async () => {});
});
