import { createHash } from "node:crypto";
import os from "node:os";
import process from "node:process";
import { format as formatDate } from "date-and-time";

export const logfile = {
	/**
	 * Create a (crash)log file
	 *
	 * @param error If this is set, create a crash log. If this is not set, create a normal log file.
	 *
	 * @returns Success
	 */
	async create(error?: Error): Promise<boolean> {
		// Create a (crash-)log file
		if (!(await game.fs.call("exists", "/logs"))) {
			await game.fs.call("mkdir", "/logs");
		}

		const now = new Date();
		const dateString = formatDate(now, "DD/MM/YYYY HH:mm:ss");

		// 23.12.24-23.59.59
		const dateStringFileFriendly = formatDate(now, "YY.MM.DD-HH.mm.ss");

		// Grab the history of the game
		let history = await game.interact.processCommand("history", {
			echo: false,
			debug: true,
		});

		if (typeof history !== "string") {
			throw new TypeError("createLogFile history did not return a string.");
		}

		// Strip the color codes from the history
		history = game.color.stripAll(history);

		/*
		 * AI log
		 * Do this so it can actually run '/ai'
		 */
		game.config.debug.commands = true;
		const aiHistory = await game.interact.processCommand("/ai", {
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
		const historyContent = `\n-- History --\n${history}-- History --\n`;
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
			const osRelease = game.os.runCommand("cat /etc/os-release");
			osName = osRelease.split('PRETTY_NAME="')[1].split('"\n')[0];

			// Also add information from unamer
			// Running this command on my computer returns "x86_64 GNU/Linux"
			const uname = game.os.runCommand("uname -mo");
			osName += ` (${uname.trim()})`;
		} else if (osName === "win32") {
			osName = `Windows ${os.release()}`;
		} else {
			osName = os.release();
		}

		let content = `Hearthstone.js ${name}
Date: ${dateString}
Version: ${game.info.versionString(4)}
Operating System: ${osName}
Log File Version: 1

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

		game.fs.call("writeFile", `/logs/${filename}`, content);

		if (!error) {
			return true;
		}

		console.log(
			"\n<red>The game crashed!\nCrash report created in 'logs/%s'\nPlease create a bug report at:\n%s/issues</red>",
			filename,
			game.config.general.repositoryUrl,
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
	async parse(path: string) {
		if (!(await game.fs.call("exists", path))) {
			throw new Error("File does not exist");
		}

		let content = ((await game.fs.call("readFile", path)) as string).trim();
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
			version: parseInt(version, 10),
			os,
			logVersion: parseInt(logVersion, 10),
		};

		return { header: headerObject, history, ai, config };
	},
};
