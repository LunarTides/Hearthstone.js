import { format } from "node:util";
import { version } from "@Game/../package.json";

export const infoFunctions = {
	version(): { version: string; branch: string; build: number } {
		const ver = version.split("-")[0];
		const branch = version.split("-")[1].split(".")[0];
		const build = Number.parseInt(version.split("-")[1].split(".")[1]);

		return {
			version: ver,
			branch,
			build,
		};
	},

	/**
	 * Returns the version of the game.
	 *
	 * If detail is 1:
	 * version
	 *
	 * If detail is 2:
	 * version-branch
	 *
	 * If detail is 3:
	 * version-branch.build
	 *
	 * If detail is 4:
	 * version-branch.build (commit hash)
	 */
	versionString(
		detail = 1,
		versionGetter:
			| undefined
			| (() => { version: string; branch: string; build: number }) = undefined,
	): string {
		const actualVersionGetter =
			versionGetter === undefined ? this.version : versionGetter;

		const { version: ver, branch, build } = actualVersionGetter();

		switch (detail) {
			case 1: {
				return format("%s", ver);
			}

			case 2: {
				return format("%s-%s", ver, branch);
			}

			case 3: {
				if (build === 0) {
					return format("%s-%s", ver, branch);
				}

				return format("%s-%s.%s", ver, branch, build);
			}

			case 4: {
				if (build === 0) {
					return format("%s-%s (%s)", ver, branch, this.latestCommit());
				}

				return format("%s-%s.%s (%s)", ver, branch, build, this.latestCommit());
			}

			default: {
				throw new Error("Invalid detail amount");
			}
		}
	},

	/**
	 * Returns the latest commit hash
	 */
	latestCommit(): string {
		if (game.cache.latestCommitHash === undefined) {
			// Save to a cache since `runCommand` is slow.
			try {
				game.cache.latestCommitHash = game.functions.util
					.runCommand("git rev-parse --short=7 HEAD")
					.trim();
			} catch (error) {
				/*
				 * Sets the cache to the error in order to prevent
				 * repeatedly trying to get the latest commit hash
				 * even though it will always fail.
				 */
				game.cache.latestCommitHash = error;
				logger.debug("Failed to get latest commit hash:", error.stack);
				console.log("<red>ERROR: Git is not installed.</red>");
				return "no git found";
			}
		}

		return game.cache.latestCommitHash as string;
	},
};
