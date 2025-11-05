import { describe, expect, test } from "bun:test";
import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { Keyword, Location, Type } from "@Game/types.ts";

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
await createGame();

describe("src/card", () => {
	test.todo("allFromName - static", async () => {});
	test.todo("create - static", async () => {});
	test.todo("fromName - static", async () => {});
	test.todo("fromID - static", async () => {});
	test.todo("all - static", async () => {});
	test.todo("allWithTags - static", async () => {});
	test.todo("fromUUID - static", async () => {});
	test.todo("registerAll - static", async () => {});
	test.todo("reloadAll - static", async () => {});
	test.todo("setup", async () => {});
	test.todo("randomizeUUID", async () => {});
	test.todo("doBlueprint", async () => {});
	test.todo("addAbility", async () => {});

	test("hasKeyword", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.hasKeyword(Keyword.Dormant)).toBe(false);

		card.addKeyword(Keyword.Dormant);
		expect(card.hasKeyword(Keyword.Dormant)).toBe(true);
	});

	test("addKeyword", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.addKeyword(Keyword.Dormant)).toBe(true);
		expect(card.hasKeyword(Keyword.Dormant)).toBe(true);

		card.attackTimes = 0;

		expect(card.sleepy).toBe(true);
		expect(card.addKeyword(Keyword.Charge)).toBe(true);
		expect(card.attackTimes).toBe(0);
		expect(card.sleepy).toBe(false);
		expect(card.canAttackHero).toBe(true);

		card.sleepy = true;
		expect(card.addKeyword(Keyword.Rush)).toBe(true);
		expect(card.attackTimes).toBe(0);
		expect(card.sleepy).toBe(false);
		expect(card.canAttackHero).toBe(false);

		expect(card.addKeyword(Keyword.CantAttack)).toBe(true);
		expect(card.sleepy).toBe(true);

		expect(card.removeKeyword(Keyword.CantAttack)).toBe(true);
		// removeKeyword shouldn't reverse the effect of addKeyword.
		expect(card.sleepy).toBe(true);

		expect(card.addKeyword(Keyword.UnlimitedAttacks)).toBe(true);
		expect(card.attackTimes).toBe(1);
		expect(card.sleepy).toBe(false);
	});

	test("removeKeyword", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		card.addKeyword(Keyword.Dormant);
		expect(card.hasKeyword(Keyword.Dormant)).toBe(true);

		expect(card.removeKeyword(Keyword.Dormant)).toBe(true);
		expect(card.hasKeyword(Keyword.Dormant)).toBe(false);
	});

	test("getKeyword", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.setKeyword(Keyword.Dormant, 3)).toBe(false);

		card.addKeyword(Keyword.Dormant);
		expect(card.hasKeyword(Keyword.Dormant)).toBe(true);

		expect(card.setKeyword(Keyword.Dormant, 3)).toBe(true);
		expect(card.getKeyword(Keyword.Dormant)).toBe(3);
	});

	test("setKeyword", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.setKeyword(Keyword.Dormant, 3)).toBe(false);

		card.addKeyword(Keyword.Dormant);
		expect(card.hasKeyword(Keyword.Dormant)).toBe(true);

		expect(card.setKeyword(Keyword.Dormant, 3)).toBe(true);
		expect(card.getKeyword(Keyword.Dormant)).toBe(3);
	});

	test("freeze", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.hasKeyword(Keyword.Frozen)).toBe(false);

		await card.freeze();
		expect(card.hasKeyword(Keyword.Frozen)).toBe(true);
	});

	test("decAttack", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.attackTimes).toBe(1);

		expect(card.decAttack()).toBe(true);
		expect(card.attackTimes).toBe(0);
		expect(card.sleepy).toBe(true);

		card.sleepy = false;

		expect(card.decAttack()).toBe(false);

		card.attackTimes = 2;
		expect(card.decAttack()).toBe(true);
		expect(card.attackTimes).toBe(1);
		expect(card.sleepy).toBe(false);

		expect(card.decAttack()).toBe(true);
		expect(card.attackTimes).toBe(0);
		expect(card.sleepy).toBe(true);

		expect(card.decAttack()).toBe(false);
	});

	test("ready", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.sleepy).toBe(true);

		card.ready();
		expect(card.sleepy).toBe(false);

		card.sleepy = true;

		card.addKeyword(Keyword.CantAttack);
		expect(card.ready()).toBe(false);
		expect(card.sleepy).toBe(true);
	});

	test("setStats", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.attack).toBe(1);
		expect(card.health).toBe(1);

		card.setStats(2, 3);
		expect(card.attack).toBe(2);
		expect(card.health).toBe(3);
		expect(card.maxHealth).toBe(3);

		card.setStats(2, 4, false);
		expect(card.attack).toBe(2);
		expect(card.health).toBe(4);
		expect(card.maxHealth).toBe(3);
	});

	test("addStats", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.attack).toBe(1);
		expect(card.health).toBe(1);

		card.addStats(2, 3);
		expect(card.attack).toBe(3);
		expect(card.health).toBe(4);
		expect(card.maxHealth).toBe(4);
	});

	test("removeStats", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.attack).toBe(1);
		expect(card.health).toBe(1);
		expect(card.maxHealth).toBe(1);

		await card.removeStats(1, 1);
		expect(card.attack).toBe(0);
		expect(card.health).toBe(0);
		expect(card.maxHealth).toBe(0);
	});

	test("addHealth", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.health).toBe(1);
		await card.addHealth(2);
		expect(card.health).toBe(1);
		expect(card.maxHealth).toBe(1);

		await card.addHealth(2, false);
		expect(card.health).toBe(3);
		expect(card.maxHealth).toBe(3);
	});

	test("removeHealth", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.health).toBe(1);

		expect(await card.removeHealth(1)).toBe(true);
		expect(card.health).toBe(0);

		await card.addHealth(1);

		card.type = Type.Location;
		expect(await card.removeHealth(1)).toBe(false);
		expect(card.health).toBe(1);
		card.type = Type.Minion;

		expect(await card.removeHealth(1)).toBe(true);
		await card.addHealth(1);

		// Check if keywords actually prevent damage.
		card.addKeyword(Keyword.Stealth);
		expect(await card.removeHealth(1)).toBe(false);

		card.removeKeyword(Keyword.Stealth);
		expect(await card.removeHealth(1)).toBe(true);
		expect(card.health).toBe(0);

		await card.addHealth(1);

		card.addKeyword(Keyword.Immune);
		// Immune prevents damage. removeHealth returns true, and health remains unchanged.
		expect(await card.removeHealth(1)).toBe(true);
		expect(card.health).toBe(1);
		card.removeKeyword(Keyword.Immune);

		// Check if it actually destroys the weapon.
		const weapon = await Card.create(game.cardIds.wickedKnife22, game.player);
		await game.player.setWeapon(weapon);
		expect(game.player.weapon).not.toBeUndefined();
		expect(await weapon.removeHealth(9999)).toBe(true);
		expect(game.player.weapon).toBeUndefined();
	});

	test("resetMaxHealth", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.maxHealth).toBe(1);

		card.health = 3;
		card.resetMaxHealth();
		expect(card.maxHealth).toBe(3);
	});

	test("setStealthDuration", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.stealthDuration).toBe(0);

		game.turn = 3;

		card.setStealthDuration(1);
		expect(card.stealthDuration).toBe(game.turn + 1);
	});

	test("resetAttackTimes", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.attackTimes).toBe(1);

		card.addKeyword(Keyword.Windfury);
		card.resetAttackTimes();
		expect(card.attackTimes).toBe(2);

		card.addKeyword(Keyword.MegaWindfury);
		card.resetAttackTimes();
		expect(card.attackTimes).toBe(4);

		card.removeKeyword(Keyword.Windfury);
		card.removeKeyword(Keyword.MegaWindfury);

		card.resetAttackTimes();
		expect(card.attackTimes).toBe(1);
	});

	test("setLocation", async () => {
		const card = await Card.create(game.cardIds.sheep1, game.player);
		expect(card.location).toBe(Location.None);

		await card.setLocation(Location.Board);
		expect(card.location).toBe(Location.Board);

		expect(game.activeCards).toContain(card);

		await card.setLocation(Location.None);
		expect(card.location).toBe(Location.None);
		expect(game.activeCards).not.toContain(card);
	});

	test.todo("canAttack", async () => {});
	test.todo("canBeAttacked", async () => {});
	test.todo("createBackup", async () => {});
	test.todo("restoreBackup", async () => {});
	test.todo("bounce", async () => {});
	test.todo("destroy", async () => {});
	test.todo("silence", async () => {});
	test.todo("removeFromPlay", async () => {});
	test.todo("reset", async () => {});
	test.todo("reload", async () => {});
	test.todo("trigger", async () => {});
	test.todo("manathirst", async () => {});
	test.todo("discard", async () => {});
	test.todo("condition", async () => {});
	test.todo("getEnchantmentInfo", async () => {});
	test.todo("applyEnchantments", async () => {});
	test.todo("addEnchantment", async () => {});
	test.todo("enchantmentExists", async () => {});
	test.todo("removeEnchantment", async () => {});
	test.todo("replacePlaceholders", async () => {});
	test.todo("perfectCopy", async () => {});
	test.todo("imperfectCopy", async () => {});
	test.todo("canBeOnBoard", async () => {});
	test.todo("hasStats", async () => {});
	test.todo("isAlive", async () => {});
	test.todo("validateForDeck", async () => {});
	test.todo("adapt", async () => {});
	test.todo("galakrondBump", async () => {});
	test.todo("tryInfuse", async () => {});
	test.todo("colorFromRarity", async () => {});
	test.todo("coloredUUID", async () => {});
	test.todo("takeControl", async () => {});
	test.todo("attackTarget", async () => {});
	test.todo("readable", async () => {});
	test.todo("view", async () => {});
});
