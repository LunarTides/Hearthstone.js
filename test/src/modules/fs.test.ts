import { fileSystem as fs } from "@Game/modules/fs.ts";
import { describe, expect, test } from "bun:test";

describe("src/modules/fs", () => {
	test.todo("fs", async () => {});
	test.todo("searchFolder", async () => {});
	test.todo("searchCardsFolder", async () => {});

	test("restrictPath", async () => {
		const match = (path: string) => {
			expect(fs.restrictPath(path)).toEqual(`${fs.dirname()}/cards/`);
		};

		// All of these should resolve to "(Path to the folder where hearthstone.js is stored)/Hearthstone.js/cards/"
		match("/cards/");
		match("~/cards/");
		match("./cards/");
		match("cards/");
		match(`${fs.dirname()}/cards/`);

		// Try to escape the directory, shouldn't work
		match("../cards/");

		/*
		 * Try different exploits.
		 * If it removes the first instance of "../",
		 * it should become "../cards/"
		 *
		 * This shouldn't work though
		 */
		match("..././cards/");

		/**
		 * If it removes the first instance of "..", and then "../",
		 * it should become "../cards/"
		 *
		 * This also shouldn't work, since it removes all instances of ".." and "../"
		 */
		match("....././cards/");
	});

	test.todo("dirname", async () => {});
});
