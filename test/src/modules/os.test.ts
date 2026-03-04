import { os } from "@Game/modules/os.ts";
import { describe, expect, test } from "bun:test";

describe("src/modules/os", () => {
	test("runCommand", async () => {
		/*
		 * Bun is the only program that is guaranteed to be installed
		 * We shouldn't count on other programs / commands being installed here
		 */
		const command = "bun --version";
		const result = os.runCommand(command);

		expect(result).toStartWith(Bun.version);
	});

	test.todo("openInBrowser", async () => {});
});
