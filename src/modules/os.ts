import childProcess from "node:child_process";
import process from "node:process";

export const os = {
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

		game.os.runCommand(`${start} ${link}`);
	},
};
