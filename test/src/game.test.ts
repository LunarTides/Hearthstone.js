import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { GamePlayCardReturn } from "@Game/types.ts";
import { describe, expect, test } from "bun:test";

/*
 * Need to create a game in case the functions need it.
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

	test("play", async () => {
		// TODO: Expand this test to cover more cases. So far it only covers:
		// - Success
		// - Cost
		// - Space

		const sheep = await Card.create(game.cardIds.sheep_1, game.player);
		const play = async (player = game.player) => {
			const card = await sheep.imperfectCopy();
			await player.addToHand(card);
			expect(player.hand).toContain(card);

			const handSize = player.hand.length;
			const mana = player.mana;
			const returnValue = await game.play(card, player);

			if (returnValue === GamePlayCardReturn.Success) {
				expect(player.hand).not.toContain(card);
				expect(player.hand).toBeArrayOfSize(handSize > 0 ? handSize - 1 : 0);
				expect(player.mana).toBe(mana > 0 ? mana - 1 : 0);
			} else {
				// An error in `game.play` should result in the card remaining in their hand.
				expect(player.hand).toContain(card);
				expect(player.hand).toBeArrayOfSize(handSize);
				expect(player.mana).toBe(mana);
			}

			return returnValue;
		};

		expect(game.player.board).toBeArrayOfSize(0);

		// Cost
		let returnValue = await play();
		expect(returnValue).toBe(GamePlayCardReturn.Cost);
		expect(game.player.board).toBeArrayOfSize(0);

		// Success
		game.player.mana = 100;

		returnValue = await play();
		expect(returnValue).toBe(GamePlayCardReturn.Success);
		expect(game.player.board).toBeArrayOfSize(1);

		// Space
		for (let i = 0; i < game.config.general.maxBoardSpace - 1; i++) {
			expect(await play()).toBe(GamePlayCardReturn.Success);
		}

		returnValue = await play();
		expect(returnValue).toBe(GamePlayCardReturn.Space);
		expect(game.player.board).toBeArrayOfSize(
			game.config.general.maxBoardSpace,
		);
	});

	test.todo("summon", async () => {});
});
