import { describe, expect, test } from "bun:test";
import { createGame } from "@Game/game.js";
import { Player } from "@Game/player.js";

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
createGame();

describe("src/core/player", () => {
	test("fromID - static", async () => {
		expect(Player.fromID(0)).toEqual(game.player1);
		expect(Player.fromID(1)).toEqual(game.player2);
		// This is so that Player.fromID always returns Player instead of Player | undefined
		expect(Player.fromID(2)).toEqual(game.player2);
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

	test.todo("addOverload", async () => {
		expect(false).toEqual(true);
	});

	test.todo("setWeapon", async () => {
		expect(false).toEqual(true);
	});

	test.todo("destroyWeapon", async () => {
		expect(false).toEqual(true);
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

	test.todo("addAttack", async () => {
		expect(false).toEqual(true);
	});

	test.todo("addHealth", async () => {
		expect(false).toEqual(true);
	});

	test.todo("remHealth", async () => {
		expect(false).toEqual(true);
	});

	test.todo("shuffleDeck", async () => {
		expect(false).toEqual(true);
	});

	test.todo("shuffleIntoDeck", async () => {
		expect(false).toEqual(true);
	});

	test.todo("addToBottomOfDeck", async () => {
		expect(false).toEqual(true);
	});

	test.todo("drawCards", async () => {
		expect(false).toEqual(true);
	});

	test.todo("drawSpecific", async () => {
		expect(false).toEqual(true);
	});

	test.todo("addToHand", async () => {
		expect(false).toEqual(true);
	});

	test.todo("setHero", async () => {
		expect(false).toEqual(true);
	});

	test.todo("setToStartingHero", async () => {
		expect(false).toEqual(true);
	});

	test.todo("heroPower", async () => {
		expect(false).toEqual(true);
	});

	test.todo("tradeCorpses", async () => {
		expect(false).toEqual(true);
	});

	test.todo("canUseCorpses", async () => {
		expect(false).toEqual(true);
	});

	test.todo("canUseRunes", async () => {
		expect(false).toEqual(true);
	});

	test.todo("canBeAttacked", async () => {
		expect(false).toEqual(true);
	});

	test.todo("canUseHeroPower", async () => {
		expect(false).toEqual(true);
	});

	test.todo("isAlive", async () => {
		expect(false).toEqual(true);
	});

	test.todo("getRemainingBoardSpace", async () => {
		expect(false).toEqual(true);
	});

	test.todo("getRemainingHandSpace", async () => {
		expect(false).toEqual(true);
	});

	test.todo("testRunes", async () => {
		expect(false).toEqual(true);
	});

	test.todo("mulligan", async () => {
		expect(false).toEqual(true);
	});

	test.todo("createJade", async () => {
		expect(false).toEqual(true);
	});

	test.todo("discard", async () => {
		expect(false).toEqual(true);
	});

	test.todo("doTargets", async () => {
		expect(false).toEqual(true);
	});

	test.todo("highlander", async () => {
		expect(false).toEqual(true);
	});

	test.todo("progressQuest", async () => {
		expect(false).toEqual(true);
	});

	test.todo("addQuest", async () => {
		expect(false).toEqual(true);
	});

	test.todo("invoke", async () => {
		expect(false).toEqual(true);
	});

	test.todo("recruit", async () => {
		expect(false).toEqual(true);
	});

	test.todo("joust", async () => {
		expect(false).toEqual(true);
	});

	test.todo("summon", async () => {
		expect(false).toEqual(true);
	});

	test.todo("attackTarget", async () => {
		expect(false).toEqual(true);
	});

	test.todo("spawnInDIYCard", async () => {
		expect(false).toEqual(true);
	});
});
