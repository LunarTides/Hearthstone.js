import { describe, expect, test } from "bun:test";
import { createGame } from "@Game/game.ts";

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
await createGame();

describe("src/game", () => {
	test.todo("input", async () => {});
	test.todo("pause", async () => {});
	test.todo("doConfigAi", async () => {});
	test.todo("triggerEventListeners", async () => {});
	test.todo("startGame", async () => {});
	test.todo("endGame", async () => {});
	test.todo("endTurn", async () => {});
	test.todo("killCardsOnBoard", async () => {});
	test.todo("createGame", async () => {});
	test.todo("attack", async () => {});
	test.todo("play", async () => {});
	test.todo("summon", async () => {});
});
