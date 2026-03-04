import { info } from "@Game/modules/info.ts";
import { describe, expect, test } from "bun:test";
import { format } from "node:util";

describe("src/functions/info", () => {
	test.todo("version", async () => {});

	test("versionString", async () => {
		const { version, branch } = info.version();

		expect(
			info.versionString(1, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(format("%s", version));

		expect(
			info.versionString(2, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(format("%s-%s", version, branch));

		// If the build is 0, we don't want to show it
		expect(
			info.versionString(3, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(format("%s-%s", version, branch));

		expect(
			info.versionString(4, () => {
				return { version, branch, build: 0 };
			}),
		).toEqual(format("%s-%s (%s)", version, branch, info.latestCommit()));

		expect(
			info.versionString(3, () => {
				return { version, branch, build: 1 };
			}),
		).toEqual(format("%s-%s.1", version, branch));

		expect(
			info.versionString(4, () => {
				return { version, branch, build: 1 };
			}),
		).toEqual(format("%s-%s.1 (%s)", version, branch, info.latestCommit()));

		expect(info.versionString.bind(info, 5)).toThrow("Invalid detail amount");
	});

	test("latestCommit", async () => {
		let latestCommit: string | undefined;

		try {
			latestCommit = game.os.runCommand("git rev-parse --short=7 HEAD").trim();
		} catch {
			return;
		}

		expect(info.latestCommit()).toEqual(latestCommit);
		expect(game.cache.latestCommitHash).toEqual(latestCommit);
	});
});
