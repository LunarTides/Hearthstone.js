import { describe, expect, test } from "bun:test";
import { format } from "node:util";
import { infoFunctions } from "@Game/functions/info.ts";

describe("src/functions/info", () => {
	test.todo("version", async () => {});

	test("versionString", async () => {
		const { version, branch } = infoFunctions.version();

		expect(
			infoFunctions.versionString(1, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(format("%s", version));

		expect(
			infoFunctions.versionString(2, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(format("%s-%s", version, branch));

		// If the build is 0, we don't want to show it
		expect(
			infoFunctions.versionString(3, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(format("%s-%s", version, branch));

		expect(
			infoFunctions.versionString(4, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(
			format("%s-%s (%s)", version, branch, infoFunctions.latestCommit()),
		);

		expect(
			infoFunctions.versionString(3, () => {
				return { version, branch, build: 1 };
			}),
		).toEqual(format("%s-%s.1", version, branch));

		expect(
			infoFunctions.versionString(4, () => {
				return { version, branch, build: 1 };
			}),
		).toEqual(
			format("%s-%s.1 (%s)", version, branch, infoFunctions.latestCommit()),
		);

		expect(infoFunctions.versionString.bind(infoFunctions, 5)).toThrow(
			"Invalid detail amount",
		);
	});

	test("latestCommit", async () => {
		let latestCommit: string | undefined;

		try {
			latestCommit = game.functions.util
				.runCommand("git rev-parse --short=7 HEAD")
				.trim();
		} catch {
			return;
		}

		expect(infoFunctions.latestCommit()).toEqual(latestCommit);
		expect(game.cache.latestCommitHash).toEqual(latestCommit);
	});
});
