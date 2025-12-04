import type { GameConfig, Target } from "@Game/types.ts";
import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
// It only confines these functions to the Hearthstone.js directory. Look in the fs wrapper functions in this file to confirm.
import fs from "node:fs/promises";
import os from "node:os";
import { dirname as pathDirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { format as formatDate } from "date-and-time";

type FsFunctionKeys = {
	[K in keyof typeof fs]: (typeof fs)[K] extends (...args: any) => any
		? K
		: never;
}[keyof typeof fs];

export const utilFunctions = {
	/**
	 * Removes `element` from `list`.
	 *
	 * @param list The list to remove from
	 * @param element The element to remove from the list
	 *
	 * @returns Success
	 */
	remove<T>(list: T[], element: T): boolean {
		if (!list.includes(element)) {
			return false;
		}

		list.splice(list.indexOf(element), 1);
		return true;
	},

	/**
	 * Align columns by padding them with spaces.
	 *
	 * This function takes a list of strings and pads them with spaces to make them the same length.
	 *
	 * @param columns The columns to align
	 * @param sep The seperator. Only the left side of the seperator will be padded
	 *
	 * @example
	 * const columns = [];
	 * columns.push('Example - Example');
	 * columns.push('Test - Hello World');
	 * columns.push('This is the longest - Short');
	 * columns.push('Tiny - This is even longer then that one!');
	 *
	 * const alignedColumns = alignColumns(columns, "-");
	 *
	 * for (const alignedColumn of alignedColumns) {
	 *     console.log(alignedColumn);
	 * }
	 * // Example             - Example
	 * // Test                - Hello World
	 * // This is the longest - Short
	 * // Tiny                - This is even longer then that one!
	 *
	 * assert.equal(alignedColumns, ["Example             - Example", "Test                - Hello World", "This is the longest - Short", "Tiny                - This is even longer then that one!"]);
	 *
	 * @returns The aligned columns
	 */
	alignColumns(columns: string[], sep: string): string[] {
		// Find the longest column, most characters to the left of the seperator.
		let longestColumn: [string, number] = ["", Number.NEGATIVE_INFINITY];

		for (const column of columns) {
			const columnSplit = column.split(sep);

			const columnLength = game.functions.color.stripAll(columnSplit[0]).length;
			if (columnLength <= longestColumn[1]) {
				continue;
			}

			longestColumn = [column, columnLength];
		}

		const alignedColumns: string[] = [];

		for (const column of columns) {
			const columnSplit = column.split(sep);
			const difference =
				longestColumn[1] - game.functions.color.stripAll(columnSplit[0]).length;

			const alignedColumn = `${columnSplit[0]}${" ".repeat(difference)}${sep}${game.lodash.tail(columnSplit).join(sep)}`;
			alignedColumns.push(alignedColumn);
		}

		return alignedColumns;
	},

	/**
	 * Imports the config and sets it to `game.config`.
	 *
	 * @returns Success
	 */
	async importConfig(): Promise<boolean> {
		delete require.cache[require.resolve("../../config.ts")];

		game.config = (await import("../../config.ts")).config as GameConfig;

		if (
			game.isEventActive(game.time.events.anniversary) &&
			game.config.general.locale === "en_US"
		) {
			game.config.general.locale = "anniversary";
		}

		return true;
	},

	/**
	 * Create a (crash)log file
	 *
	 * @param error If this is set, create a crash log. If this is not set, create a normal log file.
	 *
	 * @returns Success
	 */
	async createLogFile(error?: Error): Promise<boolean> {
		// Create a (crash-)log file
		if (!(await this.fs("exists", "/logs"))) {
			await this.fs("mkdir", "/logs");
		}

		const now = new Date();
		const dateString = formatDate(now, "DD/MM/YYYY HH:mm:ss");

		// 01.01.23-23.59.59
		const dateStringFileFriendly = formatDate(now, "DD.MM.YY-HH.mm.ss");

		// Grab the history of the game
		let history = await game.functions.interact.processCommand("history", {
			echo: false,
			debug: true,
		});

		if (typeof history !== "string") {
			throw new TypeError("createLogFile history did not return a string.");
		}

		// Strip the color codes from the history
		history = game.functions.color.stripAll(history);

		/*
		 * AI log
		 * Do this so it can actually run '/ai'
		 */
		game.config.debug.commands = true;
		const aiHistory = await game.functions.interact.processCommand("/ai", {
			echo: false,
		});

		const name = error ? "Crash Log" : "Log";

		let errorContent = "";

		if (error) {
			errorContent = `
Error:
${error.stack}
`;
		}

		const debugLogContent = `-- Log --\n${game.debugLog.join("\n")}\n-- Log --\n`;
		const historyContent = `\n-- History --${history}-- History --\n`;
		const aiContent = `\n-- AI Logs --\n${aiHistory}-- AI Logs --\n`;

		const config = JSON.stringify(game.config, null, 2);
		const configContent = `\n-- Config --\n${config}\n-- Config --`;

		let mainContent = debugLogContent + historyContent;
		if (
			game.config.ai.player1 ||
			game.config.ai.player2 ||
			game.config.ai.random
		) {
			mainContent += aiContent;
		}

		mainContent += configContent;
		mainContent += errorContent;

		let osName: string = process.platform;

		if (osName === "linux") {
			// Get the operating system name from /etc/os-release
			const osRelease = this.runCommand("cat /etc/os-release");
			osName = osRelease.split('PRETTY_NAME="')[1].split('"\n')[0];

			// Also add information from uname
			const uname = this.runCommand("uname -srvmo");
			osName += ` (${uname.trim()})`;
		} else if (osName === "win32") {
			osName = `Windows ${os.release()}`;
		}

		let content = `Hearthstone.js ${name}
Date: ${dateString}
Version: ${game.functions.info.versionString(4)}
Operating System: ${osName}
Log File Version: 3

${mainContent}
`;

		let filename = "log";
		if (error) {
			filename = "crashlog";
		}

		filename = `${filename}-${dateStringFileFriendly}.txt`;

		// Add a sha256 checksum to the content
		const checksum = createHash("sha256").update(content).digest("hex");
		content += `\n${checksum}  ${filename}`;

		this.fs("writeFile", `/logs/${filename}`, content);

		if (!error) {
			return true;
		}

		console.log(
			"\n<red>The game crashed!\nCrash report created in 'logs/%s'\nPlease create a bug report at:\n%s/issues</red>",
			filename,
			game.config.info.githubUrl,
		);

		await game.pause();

		return true;
	},

	/**
	 * Parses the contents of a log file.
	 *
	 * @param path The path to the log file.
	 *
	 * @returns An object containing the parsed log data.
	 */
	async parseLogFile(path: string) {
		if (!(await this.fs("exists", path))) {
			throw new Error("File does not exist");
		}

		let content = ((await this.fs("readFile", path)) as string).trim();
		const contentSplit = content.split("\n");
		const fileName = path.split("/").pop();

		// Verify checksum
		content = game.lodash.initial(contentSplit).join("\n");
		const checksum = `${createHash("sha256").update(content).digest("hex")}  ${fileName}`;

		const matchingChecksum = checksum === game.lodash.last(contentSplit);
		if (!matchingChecksum) {
			throw new Error("Invalid checksum");
		}

		// Checksum matches
		const [watermark, date, version, os, logVersion] = contentSplit.map(
			(l) => l.split(": ")[1],
		);

		const history = content.split("-- History --")[1].trim();
		const ai = content.split("-- AI Logs --")[1].trim();
		const config = content.split("-- Config --")[1].trim();

		const headerObject = {
			watermark,
			date,
			version: game.lodash.parseInt(version),
			os,
			logVersion: game.lodash.parseInt(logVersion),
		};

		return { header: headerObject, history, ai, config };
	},

	/**
	 * Runs a command and returns the result.
	 *
	 * This function is slow, so think about saving the output of this to `game.cache` if you intend to run this multiple times.
	 *
	 * @throws If the command times out or has a non-zero exit code
	 */
	runCommand(cmd: string): string {
		return childProcess.execSync(cmd).toString();
	},

	/**
	 * Open the provided link in the users browser.
	 *
	 * This uses the "open" command in Mac, the "start" command in Windows, and the "xdg-open" command in Linux
	 */
	openInBrowser(link: string) {
		const start =
			process.platform === "darwin"
				? "open"
				: process.platform === "win32"
					? "start"
					: "xdg-open";

		game.functions.util.runCommand(`${start} ${link}`);
	},

	/**
	 * Returns a more traditional turn counter format.
	 *
	 * `game.turns` increments at the end of every player's turn.
	 * This only increments at the end of the second player's turn.
	 */
	getTraditionalTurnCounter(): number {
		return Math.ceil(game.turn / 2);
	},

	/**
	 * Returns a language map based on the game's locale.
	 *
	 * @returns The language map
	 */
	getCachedLanguageMap(): Record<string, string> | undefined {
		return game.cache.languageMap;
	},

	/**
	 * Returns a language map based on the game's locale. Automatically updates it if it's not there.
	 *
	 * @param invalidateCache Whether to refresh the cache
	 * @returns The language map
	 */
	async importLanguageMap(
		invalidateCache = false,
	): Promise<Record<string, string>> {
		if (!invalidateCache && game.cache.languageMap) {
			return game.cache.languageMap;
		}

		if (
			!(await this.fs("exists", `/locale/${game.config.general.locale}.json`))
		) {
			return {};
		}

		const languageMap = JSON.parse(
			(await this.fs(
				"readFile",
				`/locale/${game.config.general.locale}.json`,
				{},
				{
					invalidateCache: invalidateCache,
				},
			)) as string,
		);

		game.cache.languageMap = languageMap;
		return languageMap;
	},

	/**
	 * Executes a file system operation based on the provided callback.
	 *
	 * @param callback The name of the fs operation to execute.
	 * @param args Additional arguments for the fs operation.
	 *
	 * @returns The result of the fs operation.
	 */
	fs<F extends FsFunctionKeys>(
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
	 */
	async searchFolder(
		path: string,
		callback: (
			index: number,
			path: string,
			file: Dirent<string>,
			fileContent?: string,
		) => Promise<void>,
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
				const fullPath = resolve(actualPath, file.parentPath, file.name);
				let fileContent: string | undefined;

				if (file.isFile()) {
					fileContent = (await this.fs(
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
					return await callback(fullPath, fileContent, file, index);
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

	/**
	 * Gets a random target from the game. All arguments default to true.
	 *
	 * @param includePlayer1 If it should include `game.player1` in the list of targets.
	 * @param includePlayer2 If it should include `game.player2` in the list of targets.
	 * @param includePlayer1Board If it should include player1's board in the list of targets.
	 * @param includePlayer2Board If it should include player2's board in the list of targets.
	 * @param [filter=() => true] Filter predicate.
	 */
	getRandomTarget(
		includePlayer1 = true,
		includePlayer2 = true,
		includePlayer1Board = true,
		includePlayer2Board = true,
		filter: (target: Target) => boolean = () => true,
	): Target | undefined {
		const targets: Target[] = [];

		if (includePlayer1) {
			targets.push(game.player1);
		}

		if (includePlayer2) {
			targets.push(game.player2);
		}

		if (includePlayer1Board) {
			targets.push(...game.player1.board);
		}

		if (includePlayer2Board) {
			targets.push(...game.player2.board);
		}

		return game.lodash.sample(targets.filter(filter));
	},

	/**
	 * The same as `getRandomTarget` but uses relative terms (current & opposing) rather than absolute terms (player1 & player2).
	 */
	getRandomTargetRelative(
		includeCurrentPlayer = true,
		includeOpposingPlayer = true,
		includeCurrentBoard = true,
		includeOpposingBoard = true,
		filter: (target: Target) => boolean = () => true,
	): Target | undefined {
		return this.getRandomTarget(
			(includeCurrentPlayer && game.player.id === 0) ||
				(includeOpposingPlayer && game.opponent.id === 0),
			(includeCurrentPlayer && game.player.id === 1) ||
				(includeOpposingPlayer && game.opponent.id === 1),
			(includeCurrentBoard && game.player.id === 0) ||
				(includeOpposingBoard && game.opponent.id === 0),
			(includeCurrentBoard && game.player.id === 1) ||
				(includeOpposingBoard && game.opponent.id === 1),
			filter,
		);
	},

	/**
	 * Sets the values in `game.time.events` to be accurate.
	 */
	setupTimeEvents(currentDate: Date) {
		const m = formatDate(currentDate, "MM");
		const d = formatDate(currentDate, "DD/MM");

		game.time.events.anniversary = d === "14/02";

		// Pride
		// https://en.wikipedia.org/wiki/List_of_LGBTQ_awareness_periods
		game.time.events.pride.month = m === "06";
		game.time.events.pride.agender = d === "19/05";
		game.time.events.pride.aro = d === "05/06";
		game.time.events.pride.ace = d === "06/04";
		game.time.events.pride.bi = d === "23/09";
		game.time.events.pride.genderfluid =
			m === "10" &&
			currentDate.getUTCDay() >= 17 &&
			currentDate.getUTCDay() <= 24;
		game.time.events.pride.intersex = d === "26/10";
		game.time.events.pride.lesbian = d === "08/10";
		game.time.events.pride.enby = d === "14/07";
		game.time.events.pride.pan = d === "24/05";
		game.time.events.pride.trans = d === "31/03";
	},

	/**
	 * @returns A list of emojis that correspond to the active time-based events.
	 */
	getCurrentEventEmojis(): string[] {
		const eventEmojis = [];

		if (game.isEventActive(game.time.events.anniversary)) {
			eventEmojis.push("🎂");
		}

		// Unicode inclusion is pretty bad...
		if (
			game.isEventActive(game.time.events.pride.month) ||
			game.isEventActive(game.time.events.pride.agender) ||
			game.isEventActive(game.time.events.pride.aro) ||
			game.isEventActive(game.time.events.pride.ace) ||
			game.isEventActive(game.time.events.pride.enby) ||
			game.isEventActive(game.time.events.pride.pan) ||
			game.isEventActive(game.time.events.pride.genderfluid)
		) {
			eventEmojis.push("🏳️‍🌈");
		}
		if (game.isEventActive(game.time.events.pride.trans)) {
			eventEmojis.push("🏳️‍⚧️");
		}
		if (game.isEventActive(game.time.events.pride.bi)) {
			eventEmojis.push("⚤");
		}
		if (game.isEventActive(game.time.events.pride.intersex)) {
			eventEmojis.push("⚥");
		}
		if (game.isEventActive(game.time.events.pride.lesbian)) {
			eventEmojis.push("⚢");
		}

		return eventEmojis;
	},

	/**
	 * Parses the given arguments for the eval command and returns the code to evaluate
	 */
	async parseEvalArgs(args: string[]): Promise<string> {
		if (args.length <= 0) {
			await game.pause("<red>Too few arguments.</red>\n");
			return args.join(" ");
		}

		let log = false;
		if (args[0] === "log") {
			log = true;
			args.shift();
		}

		const variables: string[] = [];
		let code = args.join(" ");

		// Allow for stuff like `/eval @Player1.addToHand(@00ff00.perfectCopy());`
		code = code.replaceAll("@Player", "game.player");

		// Replace @abcdefg with a new variable "__card_abcdefg" which contains the card with that uuid.
		const uuidsProcessed: string[] = [];
		const uuidRegex = /@\w+/g;
		for (const match of code.matchAll(uuidRegex)) {
			const uuid = match[0].slice(1);

			if (uuidsProcessed.includes(uuid)) {
				continue;
			}
			uuidsProcessed.push(uuid);

			variables.push(`const __card_${uuid} = Card.fromUUID("${uuid}");`);
			variables.push(
				`if (!__card_${uuid}) throw new Error("Card with uuid \\"${uuid}\\" not found");`,
			);
			code = code.replaceAll(`@${uuid}`, `__card_${uuid}`);
		}

		/*
		 * Allow for stuff like `/eval h#c#1.addAttack(b#o#2.attack)`;
		 * ^^ This adds the second card on the opponent's side of the board's attack to the card at index 1 in the current player's hand
		 */
		const indexBasedRegex = /#([pco])([hbdg])(\d+)/g;
		for (const match of code.matchAll(indexBasedRegex)) {
			const [line, side, where, index] = match;

			let locationString = `game.${["p", "c"].includes(side) ? "player" : "opponent"}.`;

			switch (where) {
				case "h": {
					locationString += "hand";
					break;
				}

				case "d": {
					locationString += "deck";
					break;
				}

				case "b": {
					locationString += "board";
					break;
				}

				case "g": {
					locationString += "graveyard";
					break;
				}
			}

			code = code.replace(line, `${locationString}[${index} - 1]`);
		}

		if (log) {
			// This only happens if there isn't a uuid query in the code.
			if (code.at(-1) === ";") {
				code = code.slice(0, -1);
			}

			code = `console.log(${code});await game.pause();`;
		}

		const variablesString =
			variables.length > 0
				? `\n\t// Variables\n\t${variables.join("\n\t")}\n`
				: "";

		let codeJoined = code.split(";").join(";\n\t");
		if (codeJoined.endsWith("\n\t")) {
			codeJoined = codeJoined.slice(0, -2);
		}

		const codeString = `\n\t// Code\n\t${codeJoined}\n`;

		return `(async () => {${variablesString}${codeString}})();`;
	},
};
