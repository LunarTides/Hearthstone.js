// It only confines these functions to the Hearthstone.js directory. Look in the fs wrapper functions in this file to confirm.
import fs from 'node:fs';
import { dirname as pathDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import childProcess from 'node:child_process';
import process from 'node:process';
import { createHash } from 'node:crypto';
import date from 'date-and-time';
import { type Player } from '@Game/internal.js';

export const UTIL_FUNCTIONS = {
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
     * Creates a wall.
     *
     * Walls are a formatting tool for strings, which makes them easier to read.
     * Look at the example below.
     *
     * @param bricks The array
     * @param sep The seperator.
     *
     * @example
     * const BRICKS = [];
     * BRICKS.push('Example - Example');
     * BRICKS.push('Test - Hello World');
     * BRICKS.push('This is the longest - Short');
     * BRICKS.push('Tiny - This is even longer then that one!');
     *
     * const WALL = createWall(BRICKS, "-");
     *
     * WALL.forEach(foo => {
     *     game.log(foo);
     * });
     * // Example             - Example
     * // Test                - Hello World
     * // This is the longest - Short
     * // Tiny                - This is even longer then that one!
     *
     * assert.equal(WALL, ["Example             - Example", "Test                - Hello World", "This is the longest - Short", "Tiny                - This is even longer then that one!"]);
     *
     * @returns The wall
     */
    createWall(bricks: string[], sep: string): string[] {
        // Find the longest brick, most characters to the left of the seperator.

        /**
         * The longest brick
         */
        let longestBrick: [string, number] = ['', Number.NEGATIVE_INFINITY];

        for (const BRICK of bricks) {
            const SPLIT_BRICK = BRICK.split(sep);

            const { length: LENGTH } = game.functions.color.stripAll(SPLIT_BRICK[0]);

            if (LENGTH <= longestBrick[1]) {
                continue;
            }

            longestBrick = [BRICK, LENGTH];
        }

        /**
         * The wall to return.
         */
        const WALL: string[] = [];

        for (const BRICK of bricks) {
            const SPLIT_BRICK = BRICK.split(sep);

            let strbuilder = '';
            const DIFFERENCE = longestBrick[1] - game.functions.color.stripAll(SPLIT_BRICK[0]).length;

            strbuilder += SPLIT_BRICK[0];
            strbuilder += ' '.repeat(DIFFERENCE);
            strbuilder += sep;
            strbuilder += game.lodash.tail(SPLIT_BRICK).join(sep);

            WALL.push(strbuilder);
        }

        return WALL;
    },

    /**
     * Create a (crash)log file
     *
     * @param err If this is set, create a crash log. If this is not set, create a normal log file.
     *
     * @returns Success
     */
    createLogFile(error?: Error): boolean {
        // Create a (crash-)log file
        if (!this.fs('exists', '/logs')) {
            this.fs('mkdir', '/logs');
        }

        const NOW = new Date();
        const DATE_STRING = date.format(NOW, 'DD/MM/YYYY HH:mm:ss');

        // 01.01.23-23.59.59
        const DATE_STRING_FILE_FRIENDLY = date.format(NOW, 'DD.MM.YY-HH.mm.ss');

        // Grab the history of the game
        // handleCmds("history", echo, debug)
        let history = game.interact.gameLoop.handleCmds('history', { echo: false, debug: true });
        if (typeof history !== 'string') {
            throw new TypeError('createLogFile history did not return a string.');
        }

        // Strip the color codes from the history
        history = game.functions.color.stripTags(history);
        history = game.functions.color.stripColors(history);

        // AI log
        // Do this so it can actually run '/ai'
        game.config.general.debug = true;
        const AI_HISTORY = game.interact.gameLoop.handleCmds('/ai', { echo: false });

        let name = 'Log';
        if (error) {
            name = 'Crash Log';
        }

        let errorContent = '';

        if (error) {
            errorContent = `
Error:
${error.stack}
`;
        }

        const HISTORY_CONTENT = `-- History --${history}-- History --\n`;
        const AI_CONTENT = `\n-- AI Logs --\n${AI_HISTORY}-- AI Logs --\n`;

        const CONFIG = JSON.stringify(game.config, null, 2);
        const CONFIG_CONTENT = `\n-- Config --\n${CONFIG}\n-- Config --`;

        let mainContent = HISTORY_CONTENT;
        if (game.config.ai.player1 || game.config.ai.player2) {
            mainContent += AI_CONTENT;
        }

        mainContent += CONFIG_CONTENT;
        mainContent += errorContent;

        let osName: string = process.platform;

        if (osName === 'linux') {
            // Get the operating system name from /etc/os-release
            const OS_RELEASE = this.runCommand('cat /etc/os-release');
            if (OS_RELEASE instanceof Error) {
                throw OS_RELEASE;
            }

            osName = OS_RELEASE.split('PRETTY_NAME="')[1].split('"\n')[0];

            // Also add information from uname
            const UNAME = this.runCommand('uname -srvmo');
            if (UNAME instanceof Error) {
                throw UNAME;
            }

            osName += ' (' + UNAME.trim() + ')';
        } else if (osName === 'win32') {
            osName = 'Windows';
        }

        let content = `Hearthstone.js ${name}
Date: ${DATE_STRING}
Version: ${game.functions.info.version(4)}
Operating System: ${osName}
Log File Version: 3

${mainContent}
`;

        let filename = 'log';
        if (error) {
            filename = 'crashlog';
        }

        filename = `${filename}-${DATE_STRING_FILE_FRIENDLY}.txt`;

        // Add a sha256 checksum to the content
        const CHECKSUM = createHash('sha256').update(content).digest('hex');
        content += `\n${CHECKSUM}  ${filename}`;

        this.fs('write', `/logs/${filename}`, content);

        if (!error) {
            return true;
        }

        game.log(`\n<red>The game crashed!\nCrash report created in 'logs/${filename}'\nPlease create a bug report at:\nhttps://github.com/LunarTides/Hearthstone.js/issues</red>`);
        game.pause();

        return true;
    },

    /**
     * Parses the contents of a log file.
     *
     * @param path The path to the log file.
     *
     * @returns An object containing the parsed log data.
     */
    parseLogFile(path: string) {
        if (!this.fs('exists', path)) {
            throw new Error('File does not exist');
        }

        let content = (this.fs('read', path) as string).trim();
        const CONTENT_SPLIT = content.split('\n');
        const FILE_NAME = path.split('/').pop();

        // Verify checksum
        content = game.lodash.initial(CONTENT_SPLIT).join('\n');
        const CHECKSUM = createHash('sha256').update(content).digest('hex') + '  ' + FILE_NAME;

        const MATCHING_CHECKSUM = CHECKSUM === game.lodash.last(CONTENT_SPLIT);
        if (!MATCHING_CHECKSUM) {
            throw new Error('Invalid checksum');
        }

        // Checksum matches
        const [WATERMARK, DATE, VERSION, OS, LOG_VERSION] = CONTENT_SPLIT.map(l => l.split(': ')[1]);
        const HISTORY = content.split('-- History --')[1].trim();
        const AI = content.split('-- AI Logs --')[1].trim();
        const CONFIG = content.split('-- Config --')[1].trim();

        const HEADER_OBJECT = { watermark: WATERMARK, date: DATE, version: game.lodash.parseInt(VERSION), os: OS, logVersion: game.lodash.parseInt(LOG_VERSION) };

        return { header: HEADER_OBJECT, history: HISTORY, ai: AI, config: CONFIG };
    },

    /**
     * Runs a command and returns the result.
     *
     * This function is slow, so think about saving the output of this to `game.cache` if you intend to run this multiple times.
     */
    runCommand(cmd: string): string | Error {
        try {
            return childProcess.execSync(cmd).toString();
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new TypeError('`error` is not an error in runCommand');
            }

            return error;
        }
    },

    /**
     * Tries to compile the project
     *
     * @returns If the compilation was successful
     */
    tryCompile(): boolean {
        try {
            const ERROR = this.runCommand('npx tsc');
            if (ERROR instanceof Error) {
                throw ERROR;
            }

            return true;
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new TypeError('`error` is not an error in tryCompile');
            }

            // Status 2 means compiler error
            if ((error as any).status === 2) {
                return false;
            }

            throw error;
        }
    },

    /**
     * Creates a child process and runs a command in it.
     *
     * @param command The command/program to run
     *
     * @returns Success
     *
     * @example
     * // Opens notepad to "foo.txt" in the main folder.
     * const SUCCESS = runCommandAsChildProcess("notepad foo.txt");
     *
     * // Wait until the user presses enter. This function automatically prints a traceback to the screen but will not pause by itself.
     * if (!SUCCESS) game.pause();
     */
    runCommandAsChildProcess(command: string): boolean {
        // Windows vs Linux. Pros and Cons:
        if (process.platform === 'win32') {
            // Windows
            this.runCommand(`start ${command}`);
        } else {
            // Linux (/ Mac)
            command = command.replaceAll('\\', '/');

            const ATTEMPTS: string[] = [];

            const isCommandAvailable = (testCommand: string, argsSpecifier: string) => {
                game.log(`Trying '${testCommand} ${argsSpecifier}${command}'...`);
                ATTEMPTS.push(testCommand);

                const ERROR = this.runCommand(`which ${testCommand} 2> /dev/null`);
                if (ERROR instanceof Error) {
                    return false;
                }

                childProcess.exec(`${testCommand} ${argsSpecifier}${command}`);

                game.log('Success!');

                return true;
            };

            if (isCommandAvailable('x-terminal-emulator', '-e ')) {
                // Success
            } else if (isCommandAvailable('gnome-terminal', '-- ')) {
                // Success
            } else if (isCommandAvailable('xterm', '-e ')) {
                // Success
            } else if (isCommandAvailable('konsole', '-e ')) {
                // Sucess
            } else if (isCommandAvailable('xfce4-terminal', '--command=')) {
                // Sucess
            } else {
                game.log('Error: Failed to open program. Traceback:');
                game.log('Operating system: Linux');

                for (const ATTEMPT of ATTEMPTS) {
                    game.log(`Tried '${ATTEMPT}'... failed!`);
                }

                game.log('Please install any of these using your package manager.');
                game.log('If you\'re not using linux, open up an issue on the github page.');
                // Game.pause(); <- It is your job to pause the program when you run this, since function.ts functions should generally not pause the game.

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
     *
     * @returns The player
     */
    getPlayerFromId(id: number): Player {
        if (id === 0) {
            return game.player1;
        }

        return game.player2;
    },

    /**
     * Executes a file system operation based on the provided callback.
     *
     * @param callback The name of the fs operation to execute.
     * @param path The path of the file or directory.
     * @param args Additional arguments for the fs operation.
     *
     * @returns The result of the fs operation.
     */
    fs(callback: keyof typeof fs, path: string, ...args: any[]): any {
        path = this.restrictPath(path);
        if (callback.endsWith('Sync')) {
            callback = callback.replace('Sync', '') as keyof typeof fs;
        }

        if (callback === 'write') {
            callback = 'writeFile';
        }

        if (callback === 'read') {
            callback = 'readFile';
        }

        const CALLBACK = fs[callback + 'Sync' as keyof typeof fs];
        if (typeof CALLBACK !== 'function') {
            throw new TypeError(`Invalid fs function: ${callback}Sync`);
        }

        if (callback === 'readFile') {
            if (!game.cache.files) {
                game.cache.files = {};
            }

            const CACHED = game.cache.files[path] as string | undefined;

            if (args[0]?.invalidateCache && CACHED) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete game.cache.files[path];
            } else if (CACHED) {
                return CACHED;
            }

            const CONTENT = fs.readFileSync(path, { encoding: 'utf8' });
            game.cache.files[path] = CONTENT;
            return CONTENT;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return (CALLBACK as (path: string, ...args: any[]) => any)(path, ...args);
    },

    /**
     * Calls `callback` on all cards in the cards folder.
     *
     * @param path By default, this is the cards folder (not in dist)
     * @param extension The extension to look for in cards. By default, this is ".ts"
     */
    searchCardsFolder(callback: (path: string, content: string, file: fs.Dirent) => void, path = '/cards', extension = '.ts') {
        path = path.replaceAll('\\', '/');

        for (const FILE of this.fs('readdir', path, { withFileTypes: true }) as fs.Dirent[]) {
            const FULL_PATH = `${path}/${FILE.name}`;

            if (FILE.name === 'exports.ts') {
                continue;
            }

            if (FILE.name.endsWith(extension)) {
                // It is an actual card.
                const DATA = this.fs('read', FULL_PATH) as string;

                callback(FULL_PATH, DATA, FILE);
            } else if (FILE.isDirectory()) {
                this.searchCardsFolder(callback, FULL_PATH, extension);
            }
        }
    },

    /**
     * Confines the path specified to the Hearthstone.js folder.
     * There are no known ways to bypass this.
     */
    restrictPath(path: string): string {
        path = path.replaceAll('\\', '/');
        path = path.replaceAll(this.dirname(), '');

        // Prevent '..' usage
        path = path.replaceAll('../', '');
        path = path.replaceAll('..', '');

        // Remove "~/", "./", or "/" from the start of the path
        path = path.replace(/^[~.]?\//, '');

        // The path doesn't begin with a "/", so we add one in
        path = this.dirname() + '/' + path;

        return path;
    },

    /**
     * Returns the directory name of the program.
     *
     * # Example
     * ```ts
     * // Outputs: "(path to the folder where hearthstone.js is stored)/Hearthstone.js/cards/the_coin.ts"
     * game.log(dirname() + "/cards/the_coin.ts");
     * ```
     *
     * @returns The directory name.
     */
    dirname(): string {
        let dirname = pathDirname(fileURLToPath(import.meta.url)).replaceAll('\\', '/');
        dirname = dirname.split('/dist')[0];

        return dirname;
    },
};
