// It only confines these functions to the Hearthstone.js directory. Look in the fs wrapper functions in this file to confirm.
import fs from 'node:fs';
import {dirname as pathDirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const directory = {
    /**
     * Reads a directory. Please use this instead of `fs.readdirSync`.
     *
     * # Examples
     * ```ts
     * read("/cards");
     * // Reads the folder at "(path to folder where Hearthstone.js is)/Hearthstone.js/cards"
     * ```
     */
    read(_path: string): fs.Dirent[] {
        const path = game.functions.file.restrictPath(_path);
        return fs.readdirSync(path, {withFileTypes: true});
    },

    /**
     * Creates a directory. Please use this instead of `fs.mkdirSync`.
     *
     * # Examples
     * ```ts
     * create("/cards");
     * // Creates the directory "(path to folder where Hearthstone.js is)/Hearthstone.js/cards"
     * ```
     */
    create(_path: string, recursive = false) {
        const path = game.functions.file.restrictPath(_path);
        return fs.mkdirSync(path, {recursive});
    },

    /**
     * Deletes the directory at path. Please use this instead of `fs.rmSync`.
     *
     * # Examples
     * ```ts
     * delete("/cards/");
     * // Deletes "(path to folder where Hearthstone.js is)/Hearthstone.js/cards/"
     * ```
     */
    delete(_path: string) {
        const path = game.functions.file.restrictPath(_path);
        fs.rmSync(path);
    },

    /**
     * Deletes the directory at path, forcibly and recursively. Same as doing 'rm -rf' on linux. Please use this instead of `fs.rmSync`.
     *
     * # Examples
     * ```ts
     * rmrf("/cards/");
     * // Deletes "(path to folder where Hearthstone.js is)/Hearthstone.js/cards/"
     * ```
     */
    rmrf(_path: string) {
        const path = game.functions.file.restrictPath(_path);
        fs.rmSync(path, {force: true, recursive: true});
    },

    /**
     * Calls `callback` on all cards in the cards folder.
     *
     * @param path By default, this is the cards folder (not in dist)
     * @param extension The extension to look for in cards. By default, this is ".ts"
     */
    searchCards(callback: (path: string, content: string, file: fs.Dirent) => void, path = '/cards', extension = '.ts') {
        path = path.replaceAll('\\', '/');

        for (const file of this.read(path)) {
            const fullPath = `${path}/${file.name}`;

            if (file.name.endsWith(extension)) {
                if (file.name === 'exports.ts') {
                    continue;
                }

                // It is an actual card.
                const data = game.functions.file.read(fullPath);

                callback(fullPath, data, file);
            } else if (file.isDirectory()) {
                this.searchCards(callback, fullPath, extension);
            }
        }
    },
};

export const fsFunctions = {
    /**
     * Directory related functions
     */
    directory,

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
     * Writes a file to path. Please use this instead of `fs.writeFileSync`.
     *
     * # Examples
     * ```ts
     * write("/cards/.latestId", "100");
     * // Writes "100" to "(path to folder where Hearthstone.js is)/Hearthstone.js/cards/.latestId"
     * ```
     */
    write(_path: string, content: string) {
        const path = this.restrictPath(_path);
        fs.writeFileSync(path, content);
    },

    /**
     * Reads a file from a path. Please use this instead of `fs.readFileSync`.
     *
     * # Examples
     * ```ts
     * read("/cards/.latestId");
     * // Reads from "(path to folder where Hearthstone.js is)/Hearthstone.js/cards/.latestId"
     * ```
     */
    read(_path: string, invalidateCache = false): string {
        const path = this.restrictPath(_path);

        if (!game.cache.files) {
            game.cache.files = {};
        }

        const cached = game.cache.files[path] as string | undefined;

        if (invalidateCache && cached) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete game.cache.files[path];
        } else if (cached) {
            return cached;
        }

        const content = fs.readFileSync(path, {encoding: 'utf8'});
        game.cache.files[path] = content;

        return content;
    },

    /**
     * Deletes a file from path. Please use this instead of `fs.unlinkSync` or `fs.rmSync`..
     *
     * # Examples
     * ```ts
     * delete("/cards/.latestId");
     * // Deletes "(path to folder where Hearthstone.js is)/Hearthstone.js/cards/.latestId"
     * ```
     */
    delete(_path: string) {
        const path = this.restrictPath(_path);
        fs.rmSync(path);
    },

    /**
     * Returns if a file exists. Please use this instead of `fs.existsSync`.
     *
     * # Examples
     * ```ts
     * exists("/cards/.latestId");
     * // Returns if the file at "(path to folder where Hearthstone.js is)/Hearthstone.js/cards/.latestId" exists.
     * ```
     */
    exists(_path: string) {
        const path = this.restrictPath(_path);
        return fs.existsSync(path);
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
     * @return The directory name.
     */
    dirname(): string {
        let dirname = pathDirname(fileURLToPath(import.meta.url)).replaceAll('\\', '/');
        dirname = dirname.split('/dist')[0];

        return dirname;
    },
};
