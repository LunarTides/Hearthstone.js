import type { Dirent } from "node:fs";
// It only confines these functions to the Hearthstone.js directory. Look in the fs wrapper functions in this file to confirm.
import fs from "node:fs/promises";
import { dirname as pathDirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

type FsFunctionKeys = {
	[K in keyof typeof fs]: (typeof fs)[K] extends (...args: any) => any
		? K
		: never;
}[keyof typeof fs];

export const fileSystem = {
	/**
	 * Executes a file system operation based on the provided callback.
	 *
	 * @param callback The name of the fs operation to execute.
	 * @param args Additional arguments for the fs operation.
	 *
	 * @returns The result of the fs operation.
	 */
	call<F extends FsFunctionKeys>(
		callback: F,
		...args: [...Parameters<(typeof fs)[F]>, { invalidateCache?: boolean }?]
	): Promise<ReturnType<(typeof fs)[F]>> {
		const path = args[0];
		if (typeof path !== "string") {
			throw new TypeError("Path must be a string");
		}

		const actualPath = this.restrictPath(path);
		args.splice(0, 1);

		const callbackFunction = fs[callback] as (
			actualPath: string,
			...args: unknown[]
		) => Promise<ReturnType<(typeof fs)[F]>>;

		if (typeof callbackFunction !== "function") {
			throw new TypeError(`Invalid fs function: ${callback}`);
		}

		const options = game.lodash.last(args);

		// Cache files when they are read
		if (callback === "readFile") {
			if (!game.cache.files) {
				game.cache.files = {};
			}

			let invalidateCache = false;

			if (
				options &&
				typeof options === "object" &&
				"invalidateCache" in options &&
				options.invalidateCache
			) {
				invalidateCache = options.invalidateCache ?? false;
			}

			const cached = game.cache.files[actualPath] as string | undefined;

			if (invalidateCache && cached) {
				delete game.cache.files[actualPath];
			} else if (cached) {
				return Promise.resolve(cached) as Promise<ReturnType<(typeof fs)[F]>>;
			}

			const content = callbackFunction(actualPath, { encoding: "utf8" });
			game.cache.files[actualPath] = content;
			return content;
		}

		return callbackFunction(actualPath, ...args);
	},

	/**
	 * Reursively calls `callback` on all files / folders in the specified path.
	 *
	 * @param path The path to search in.
	 * @param callback The callback to run on the files / folders.
	 * @param [readFiles=true] If it should read the content of files, and return them in the callback function. Disable for optimization.
	 */
	async searchFolder(
		path: string,
		callback: (
			index: number,
			path: string,
			file: Dirent<string>,
			fileContent?: string,
		) => Promise<void>,
		readFiles = true,
	): Promise<void> {
		const actualPath = this.restrictPath(path);

		// Native readdir due to node 24 bs.
		const files = await fs.readdir(actualPath, {
			encoding: "utf8",
			withFileTypes: true,
			recursive: true,
		});

		// Use Promise.all to read all the files in parallel
		await Promise.all(
			files.map(async (file, i) => {
				// On Linux, there isn't a starting slash for some reason.
				// TODO: Only in some cases? I can't recreate the above issue anymore...
				const root = process.platform === "win32" ? "" : "/";

				const fullPath = `${root}${resolve(actualPath, file.parentPath, file.name)}`;
				let fileContent: string | undefined;

				if (readFiles && file.isFile()) {
					fileContent = (await game.fs.call(
						"readFile",
						fullPath,
						{},
						// Don't cache cards here.
						{ invalidateCache: true },
					)) as string;
				}

				return await callback(i, fullPath, file, fileContent);
			}),
		);
	},

	/**
	 * Calls `callback` on all cards in the cards folder.
	 *
	 * @param path By default, this is the cards folder (not in dist)
	 * @param extension The extension to look for in cards. By default, this is ".ts"
	 */
	async searchCardsFolder(
		callback: (
			path: string,
			content: string,
			file: Dirent<string>,
			index: number,
			resourceType: string,
		) => Promise<void>,
		path = "/cards",
		extension = ".ts",
	): Promise<void> {
		await this.searchFolder(
			path,
			async (index, fullPath, file, fileContent) => {
				if (
					fileContent &&
					file.isFile() &&
					file.name.endsWith(extension) &&
					!file.name.startsWith("ids")
				) {
					let resourceType = "card";
					if (new RegExp(`\\..*\\${extension}$`).test(file.name)) {
						resourceType = file.name.split(".").at(-2)!;
					}

					return await callback(
						fullPath,
						fileContent,
						file,
						index,
						resourceType,
					);
				}
			},
		);
	},

	/**
	 * Confines the path specified to the Hearthstone.js folder.
	 * There are no known ways to bypass this.
	 */
	restrictPath(path: string): string {
		let newPath = path.replaceAll("\\", "/");
		newPath = newPath.replaceAll(this.dirname(), "");

		// Prevent '..' usage
		newPath = newPath.replaceAll("../", "");
		newPath = newPath.replaceAll("..", "");

		// Remove "~/", "./", or "/" from the start of the path
		newPath = newPath.replace(/^[~.]?\//, "");

		// The path doesn't begin with a "/", so we add one in
		newPath = `${this.dirname()}/${newPath}`;

		return newPath;
	},

	/**
	 * Returns the directory name of the program.
	 *
	 * # Example
	 * ```ts
	 * // Outputs: "(path to the folder where hearthstone.js is stored)/Hearthstone.js/cards/the_coin.ts"
	 * console.log(dirname() + "/cards/the_coin.ts");
	 * ```
	 *
	 * @returns The directory name.
	 */
	dirname(): string {
		let dirname = pathDirname(fileURLToPath(import.meta.url)).replaceAll(
			"\\",
			"/",
		);

		dirname = dirname.split("/src")[0];
		return dirname;
	},
};
