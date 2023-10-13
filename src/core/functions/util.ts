import childProcess from 'node:child_process';
import process from 'node:process';
import {createHash} from 'node:crypto';
import {type Player} from '@Game/internal.js';
import {type EventValue, type GameConfig, type HistoryKey} from '@Game/types.js';

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
     * Returns the last character from a string.
     */
    lastChar(string: string): string | undefined {
        return string.at(-1);
    },

    /**
     * Capitalizes all words in string
     *
     * @param str The string
     *
     * @returns The string capitalized
     */
    capitalizeAll(string_: string): string {
        return game.lodash.words(string_).map(word => game.lodash.capitalize(word)).join(' ');
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
        let longestBrick: [string, number] = ['', Number.NEGATIVE_INFINITY];

        for (const b of bricks) {
            const splitBrick = b.split(sep);

            const {length} = splitBrick[0];

            if (length <= longestBrick[1]) {
                continue;
            }

            longestBrick = [b, length];
        }

        /**
         * The wall to return.
         */
        const wall: string[] = [];

        for (const b of bricks) {
            const splitBrick = b.split(sep);

            let strbuilder = '';
            const diff = longestBrick[1] - splitBrick[0].length;

            strbuilder += splitBrick[0];
            strbuilder += ' '.repeat(diff);
            strbuilder += sep;
            strbuilder += splitBrick[1];

            wall.push(strbuilder);
        }

        return wall;
    },

    /**
     * Get the day, month, year, hour, minute, and second, as 2 digit numbers.
     */
    getDateAndTime() {
        const date = new Date();

        let day = date.getDate().toString();

        // Month is 0-11 for some reason
        let month = (date.getMonth() + 1).toString();

        // Get the last 2 digits of the year
        let year = date.getFullYear().toString().slice(2);

        let hour = date.getHours().toString();
        let minute = date.getMinutes().toString();
        let second = date.getSeconds().toString();

        if (game.lodash.parseInt(day) < 10) {
            day = `0${day}`;
        }

        if (game.lodash.parseInt(month) < 10) {
            month = `0${month}`;
        }

        if (game.lodash.parseInt(year) < 10) {
            year = `0${year}`;
        }

        if (game.lodash.parseInt(hour) < 10) {
            hour = `0${hour}`;
        }

        if (game.lodash.parseInt(minute) < 10) {
            minute = `0${minute}`;
        }

        if (game.lodash.parseInt(second) < 10) {
            second = `0${second}`;
        }

        // Assemble the time
        // 01/01/23 23:59:59
        const dateString = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

        return dateString;
    },

    /**
     * Create a (crash)log file
     *
     * @param err If this is set, create a crash log. If this is not set, create a normal log file.
     *
     * @returns Success
     */
    createLogFile(error?: Error): boolean {
        if (game.replaying) {
            return false;
        }

        // Create a (crash-)log file
        if (!game.functions.file.exists('/logs')) {
            game.functions.file.directory.create('/logs');
        }

        const dateString = this.getDateAndTime();

        // 01.01.23-23.59.59
        const dateStringFileFriendly = dateString.replaceAll(/[/:]/g, '.').replaceAll(' ', '-');

        // Grab the history of the game
        // handleCmds("history", echo, debug)
        let history = game.interact.gameLoop.handleCmds('history', {echo: false, debug: true});
        if (typeof history !== 'string') {
            throw new TypeError('createLogFile history did not return a string.');
        }

        // Strip the color codes from the history
        history = game.functions.color.stripTags(history);
        history = game.functions.color.strip(history);

        // AI log
        // Do this so it can actually run '/ai'
        game.config.general.debug = true;
        const aiHistory = game.interact.gameLoop.handleCmds('/ai', {echo: false});

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

        const historyContent = `-- History --${history}-- History --\n`;
        const aiContent = `\n-- AI Logs --\n${aiHistory}-- AI Logs --\n`;

        const config = JSON.stringify(game.config, null, 2);
        const configContent = `\n-- Config --\n${config}\n-- Config --`;

        let mainContent = historyContent;
        if (game.config.ai.player1 || game.config.ai.player2) {
            mainContent += aiContent;
        }

        mainContent += configContent;
        mainContent += errorContent;

        let osName: string = process.platform;

        if (osName === 'linux') {
            // Get the operating system name from /etc/os-release
            const osRelease = this.runCommand('cat /etc/os-release');
            if (osRelease instanceof Error) {
                throw osRelease;
            }

            osName = osRelease.split('PRETTY_NAME="')[1].split('"\n')[0];

            // Also add information from uname
            const uname = this.runCommand('uname -srvmo');
            if (uname instanceof Error) {
                throw uname;
            }

            osName += ' (' + uname.trim() + ')';
        } else if (osName === 'win32') {
            osName = 'Windows';
        }

        let content = `Hearthstone.js ${name}
Date: ${dateString}
Version: ${game.functions.info.version(4)}
Operating System: ${osName}
Log File Version: 3

${mainContent}
`;

        let filename = 'log';
        if (error) {
            filename = 'crashlog';
        }

        filename = `${filename}-${dateStringFileFriendly}.txt`;

        // Add a sha256 checksum to the content
        const checksum = createHash('sha256').update(content).digest('hex');
        content += `\n${checksum}  ${filename}`;

        game.functions.file.write(`/logs/${filename}`, content);

        if (!error) {
            return true;
        }

        game.log(`\n<red>The game crashed!\nCrash report created in 'logs/${filename}'\nPlease create a bug report at:\nhttps://github.com/LunarTides/Hearthstone.js/issues</red>`);
        game.pause();

        return true;
    },

    parseLogFile(path: string) {
        if (!game.functions.file.exists(path)) {
            return new Error('File does not exist');
        }

        let content = game.functions.file.read(path).trim();
        const contentSplit = content.split('\n');
        const filename = path.split('/').pop();

        // Verify checksum
        content = game.lodash.initial(contentSplit).join('\n');
        const checksum = createHash('sha256').update(content).digest('hex') + '  ' + filename;

        const matchingChecksum = checksum === game.lodash.last(contentSplit);
        if (!matchingChecksum) {
            return new Error('Invalid checksum');
        }

        // Checksum matches
        const [_, date, version, os, logVersion] = contentSplit.map(l => l.split(': ')[1]);
        const history = content.split('-- History --')[1].trim();
        const ai = content.split('-- AI Logs --')[1].trim();
        const config = content.split('-- Config --')[1].trim();

        const headerObject = {date, version: game.lodash.parseInt(version), os, logVersion: game.lodash.parseInt(logVersion)};

        return {header: headerObject, history, ai, config};
    },

    parseInputEventFromHistory(event: string, index: number, history: string): HistoryKey | false {
        if (!event.startsWith('Input: ')) {
            return false;
        }

        const value = event.split('Input: ')[1];

        let player: Player | undefined;

        let running = true;
        while (running) {
            index--;

            const reg = /Turn \d+ - Player \[(.+)]/.exec(history.split('\n')[index]);
            if (!reg) {
                continue;
            }

            const playerName = reg[1];
            const _player = [game.player1, game.player2].find(p => p.name === playerName);
            if (!_player) {
                throw new Error('passed regex and checksum but no player with that name');
            }

            player = _player;

            running = false;
            break;
        }

        return ['Input', value, player];
    },

    /**
     * Replays a file and returns an error if there is an issue, otherwise returns true.
     *
     * @param path the path of the file to replay
     * @param overrideEvalSafety whether to override the safety check for eval commands (default: false)
     * @return An error if there is a mismatch in log version, otherwise true
     */
    replayFile(path: string, overrideEvalSafety = false): Error | true {
        const parsed = this.parseLogFile(path);
        if (parsed instanceof Error) {
            return parsed;
        }

        const {header, history, config} = parsed;

        game.config = JSON.parse(config) as GameConfig;
        game.replaying = true;

        // TODO: Verify `header.version` using semver. #328
        const expectedLogVersion = 3;
        if (header.logVersion !== expectedLogVersion) {
            return new Error(`Mismatch in log version. Expected: ${expectedLogVersion}, Found: ${header.logVersion}`);
        }

        const parsedHistory = history.split('\n').map((l, i) => this.parseInputEventFromHistory(l, i, history));

        for (const event of parsedHistory) {
            if (!event) {
                continue;
            }

            // Create the event
            const [_, _value, player] = event;
            const value = _value as EventValue<'Input'>;

            if (!player) {
                throw new TypeError('`player` is undefined');
            }

            if (!(Array.isArray(player.inputQueue))) {
                player.inputQueue = [];
            }

            // Prevent eval commands from being replayed to prevent maliciously crafted replay files from executing code
            if (value.includes('eval')) {
                if (overrideEvalSafety) {
                    // Prompt the user to prevent the eval
                    const allow = game.input(`Would you like to allow this command to be replayed?\n${value}\n`, false, false).toLowerCase().startsWith('y');

                    if (!allow) {
                        continue;
                    }
                } else {
                    game.pause('<yellow>WARNING: Eval command has been blocked.</yellow>');
                    continue;
                }
            }

            player.inputQueue.push(value);
        }

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
            const error = this.runCommand('npx tsc');
            if (error instanceof Error) {
                throw error;
            }

            return true;
        } catch (error) {
            // Status 2 means compiler error
            if (error.status === 2) {
                return false;
            }

            throw error as Error;
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
     * if (!success) game.pause();
     */
    runCommandAsChildProcess(command: string): boolean {
        // Windows vs Linux. Pros and Cons:
        if (process.platform === 'win32') {
            // Windows
            this.runCommand(`start ${command}`);
        } else {
            // Linux (/ Mac)
            command = command.replaceAll('\\', '/');

            const attempts: string[] = [];

            const isCommandAvailable = (testCommand: string, argsSpecifier: string) => {
                game.log(`Trying '${testCommand} ${argsSpecifier}${command}'...`);
                attempts.push(testCommand);

                const error = this.runCommand(`which ${testCommand} 2> /dev/null`);
                if (error instanceof Error) {
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

                for (const a of attempts) {
                    game.log(`Tried '${a}'... failed!`);
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
     * @return The player
     */
    getPlayerFromId(id: number): Player {
        if (id === 0) {
            return game.player1;
        }

        return game.player2;
    },
};
