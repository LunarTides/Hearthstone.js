import { createHash } from "node:crypto";
import childProcess from "child_process";
import { Player } from "@Game/internal.js";

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
        if (!list.includes(element)) return false;

        list.splice(list.indexOf(element), 1);
        return true;
    },

    /**
     * Returns the last character from a string.
     */
    lastChar(string: string): string {
        return string[string.length - 1];
    },

    /**
     * Capitalizes all words in string
     *
     * @param str The string
     *
     * @returns The string capitalized
     */
    capitalizeAll(str: string): string {
        return game.lodash.words(str).map(game.lodash.capitalize).join(" ");
    },

    /**
     * Creates a wall.
     * 
     * Walls are a formatting tool for strings, which makes them easier to read.
     * Look at the example below.
     *
     * @param bricks The array
     * @param sep The seperator.
     *  
     * @example
     * const bricks = [];
     * bricks.push('Example - Example');
     * bricks.push('Test - Hello World');
     * bricks.push('This is the longest - Short');
     * bricks.push('Tiny - This is even longer then that one!');
     * 
     * const wall = createWall(bricks, "-");
     * 
     * wall.forEach(foo => {
     *     game.log(foo);
     * });
     * // Example             - Example
     * // Test                - Hello World
     * // This is the longest - Short
     * // Tiny                - This is even longer then that one!
     * 
     * assert.equal(wall, ["Example             - Example", "Test                - Hello World", "This is the longest - Short", "Tiny                - This is even longer then that one!"]);
     * 
     * @returns The wall
     */
    createWall(bricks: string[], sep: string): string[] {
        // Find the longest brick, most characters to the left of the seperator.

        /**
         * The longest brick
         */
        let longestBrick: [string, number] = ["", -Infinity];

        bricks.forEach(b => {
            const splitBrick = b.split(sep);

            const length = splitBrick[0].length;

            if (length <= longestBrick[1]) return;
            longestBrick = [b, length];
        });

        /**
         * The wall to return.
         */
        const wall: string[] = []

        bricks.forEach(b => {
            const splitBrick = b.split(sep);

            let strbuilder = "";
            const diff = longestBrick[1] - splitBrick[0].length;

            strbuilder += splitBrick[0];
            strbuilder += " ".repeat(diff);
            strbuilder += sep;
            strbuilder += splitBrick[1];

            wall.push(strbuilder);
        });

        return wall;
    },

    /**
     * Create a (crash)log file
     *
     * @param err If this is set, create a crash log. If this is not set, create a normal log file.
     *
     * @returns Success
     */
    createLogFile(err?: Error): boolean {
        // Create a (crash-)log file
        if (!game.functions.file.exists("/logs")) game.functions.file.directory.create("/logs");

        // Get the day, month, year, hour, minute, and second, as 2 digit numbers.
        const date = new Date();

        let day = date.getDate().toString();

        // Month is 0-11 for some reason
        let month = (date.getMonth() + 1).toString();

        // Get the last 2 digits of the year
        let year = date.getFullYear().toString().slice(2);

        let hour = date.getHours().toString();
        let minute = date.getMinutes().toString();
        let second = date.getSeconds().toString();

        if (parseInt(day) < 10) day = `0${day}`;
        if (parseInt(month) < 10) month = `0${month}`;
        if (parseInt(year) < 10) year = `0${year}`;

        if (parseInt(hour) < 10) hour = `0${hour}`;
        if (parseInt(minute) < 10) minute = `0${minute}`;
        if (parseInt(second) < 10) second = `0${second}`;

        // Assemble the time
        // 01/01/23 23:59:59
        const dateString = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

        // 01.01.23-23.59.59
        const dateStringFileFriendly = dateString.replace(/[/:]/g, ".").replaceAll(" ", "-");

        // Grab the history of the game
        // handleCmds("history", echo, debug)
        let history = game.interact.handleCmds("history", false, true);
        if (typeof history !== "string") throw new Error("createLogFile history did not return a string.");

        // Strip the color codes from the history
        history = game.functions.color.stripTags(history);

        // AI log
        // Do this so it can actually run '/ai'
        game.config.general.debug = true;
        const aiHistory = game.interact.handleCmds("/ai", false);

        let name = "Log";
        if (err) name = "Crash Log";

        let errorContent = "";

        if (err) errorContent = `
Error:
${err.stack}
`

        const historyContent = `-- History --${history}`;
        const aiContent = `\n-- AI Logs --\n${aiHistory}`;

        const config = JSON.stringify(game.config, null, 2);
        const configContent = `\n-- Config --\n${config}`;

        let mainContent = historyContent;
        if (game.config.ai.player1 || game.config.ai.player2) mainContent += aiContent;
        mainContent += configContent;
        mainContent += errorContent;

        let osName: string = process.platform;

        if (osName === "linux") {
            // Get the operating system name from /etc/os-release
            const osRelease = this.runCommand("cat /etc/os-release");
            if (osRelease instanceof Error) {
                throw osRelease;
            }

            osName = osRelease.split('PRETTY_NAME="')[1].split('"\n')[0];

            // Also add information from uname
            const uname = this.runCommand("uname -srvmo");
            if (uname instanceof Error) throw uname;

            osName += " (" + uname.trim() + ")";
        }
        else if (osName === "win32") osName = "Windows"
        
        let content = `Hearthstone.js ${name}
Date: ${dateString}
Version: ${game.functions.info.version(4)}
Operating System: ${osName}
Log File Version: 3

${mainContent}
`

        let filename = "log";
        if (err) filename = "crashlog";

        filename = `${filename}-${dateStringFileFriendly}.txt`;

        // Add a sha256 checksum to the content
        const checksum = createHash("sha256").update(content).digest("hex");
        content += `\n${checksum}  ${filename}`;

        game.functions.file.write(`/logs/${filename}`, content);

        if (!err) return true;

        game.log(`\n<red>The game crashed!\nCrash report created in 'logs/${filename}'\nPlease create a bug report at:\nhttps://github.com/LunarTides/Hearthstone.js/issues</red>`);
        game.input();

        return true;
    },
    
    /**
     * Runs a command and returns the result.
     * 
     * This function is slow, so think about saving the output of this to `game.cache` if you intend to run this multiple times.
     */
    runCommand(cmd: string): string | Error {
        try {
            return childProcess.execSync(cmd).toString();
        } catch (err) {
            return err;
        }
    },

    /**
     * Tries to compile the project
     * 
     * @returns If the compilation was successful 
     */
    tryCompile(): boolean {
        try {
            const error = this.runCommand("npx tsc");
            if (error instanceof Error) throw error;

            return true;
        } catch (err) {
            // Status 2 means compiler error
            if (err.status === 2) {
                return false;
            } else {
                throw err;
            }
        }
    },

    /**
     * Open a program with args
     * 
     * @param command The command/program to run
     * 
     * @returns Success
     * 
     * @example
     * // Opens notepad to "foo.txt" in the main folder.
     * const success = runCommandAsChildProcess("notepad foo.txt");
     * 
     * // Wait until the user presses enter. This function automatically prints a traceback to the screen but will not pause by itself.
     * if (!success) game.input();
     */
    runCommandAsChildProcess(command: string): boolean {
        // Windows vs Linux. Pros and Cons:
        if (process.platform == "win32") {
            // Windows
            childProcess.spawn(`start ${command}`);
        } else {
            // Linux (/ Mac)

            command = command.replaceAll("\\", "/");

            const attempts: string[] = [];

            const isCommandAvailable = (testCommand: string, argsSpecifier: string) => {
                game.log(`Trying '${testCommand} ${argsSpecifier}${command}'...`)
                attempts.push(testCommand);

                const error = this.runCommand(`which ${testCommand} 2> /dev/null`);
                if (error instanceof Error) return false;

                childProcess.exec(`${testCommand} ${argsSpecifier}${command}`);

                game.log(`Success!`);

                return true;
            }

            if (isCommandAvailable("x-terminal-emulator", "-e ")) {}
            else if (isCommandAvailable("gnome-terminal", "-- ")) {}
            else if (isCommandAvailable("xterm", "-e ")) {}
            else if (isCommandAvailable("konsole", "-e ")) {}
            else if (isCommandAvailable("xfce4-terminal", "--command=")) {}
            else {
                game.log("Error: Failed to open program. Traceback:");
                game.log("Operating system: Linux");
                
                attempts.forEach(a => {
                    game.log(`Tried '${a}'... failed!`);
                });

                game.log("Please install any of these using your package manager.");
                game.log("If you're not using linux, open up an issue on the github page.");
                // game.input(); <- It is your job to pause the program when you run this, since function.ts functions should generally not pause the game.

                return false;
            }
        }

        return true;
    },
    
    /**
     * Returns a more traditional turn counter format.
     * 
     * `game.turns` increments at the end of every player's turn.
     * This only increments at the end of the second player's turn.
     */
    getTraditionalTurnCounter() {
        return Math.ceil(game.turns / 2);
    },

    /**
     * Retrieves the player corresponding to the given id.
     * 0 is Player 1.
     * 1 is Player 2.
     *
     * @param id The id of the player - 1.
     * @return The player
     */
    getPlayerFromId(id: number): Player {
        if (id === 0) return game.player1;
        else return game.player2;
    }
}
