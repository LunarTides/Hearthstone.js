import { fileSystem as fs } from "@Game/modules/fs.ts";
import { describe, expect, test } from "bun:test";

describe("src/modules/fs", () => {
	test.todo("fs", async () => {});
	test.todo("searchFolder", async () => {});
	test.todo("searchCardsFolder", async () => {});

	test("restrictPath", async () => {
		const match = (path: string) => {
			expect(fs.restrictPath(path)).toEqual(`${fs.dirname()}/packs/`);
		};

		// All of these should resolve to "(Path to the folder where hearthstone.js is stored)/Hearthstone.js/packs/"
		match("/packs/");
		match("~/packs/");
		match("./packs/");
		match("packs/");
		match(`${fs.dirname()}/packs/`);

		// Try to escape the directory, shouldn't work
		match("../packs/");

		/*
		 * Try different exploits.
		 * If it removes the first instance of "../",
		 * it should become "../packs/"
		 *
		 * This shouldn't work though
		 */
		match("..././packs/");

		/**
		 * If it removes the first instance of "..", and then "../",
		 * it should become "../packs/"
		 *
		 * This also shouldn't work, since it removes all instances of ".." and "../"
		 */
		match("....././packs/");
	});

	test.todo("dirname", async () => {});
});
