// It only confines these functions to the Hearthstone.js directory. Look in the fs wrapper functions in this file to confirm.
import {
    writeFileSync as fsWriteFileSync,
    readFileSync as fsReadFileSync,
    unlinkSync as fsUnlinkSync,
    existsSync as fsExistsSync,
    readdirSync as fsReadDirSync,
    mkdirSync as fsMkDirSync,
    Dirent as fsDirent
} from "fs";
import { dirname as pathDirname } from "path";
import { fileURLToPath } from "url";

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
    read(_path: string): fsDirent[] {
        let path = game.functions.file.fsRestrictPath(_path);
        return fsReadDirSync(path, { withFileTypes: true });
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
        let path = game.functions.file.fsRestrictPath(_path);
        return fsMkDirSync(path, { recursive });
    },
    
    /**
     * Calls `callback` on all cards in the cards folder.
     *
     * @param path By default, this is the cards folder (not in dist)
     * @param extension The extension to look for in cards. By default, this is ".ts"
     */
    searchCards(callback: (path: string, content: string, file: fsDirent) => void, path: string = "/cards", extension = ".ts") {
        path = path.replaceAll("\\", "/");

        this.read(path).forEach(file => {
            const fullPath = `${path}/${file.name}`;

            if (file.name.endsWith(extension)) {
                if (file.name === "exports.ts") return;

                // It is an actual card.
                const data = game.functions.file.read(fullPath);

                callback(fullPath, data, file);
            }
            else if (file.isDirectory()) this.searchCards(callback, fullPath, extension);
        });
    },
}

export const fsFunctions = {
    /**
     * Directory related functions
     */
    directory,

    /**
     * Confines the path specified to the Hearthstone.js folder.
     * There are no known ways to bypass this.
     */
    fsRestrictPath(path: string): string {
        path = path.replaceAll("\\", "/");
        path = path.replaceAll(this.dirname(), "");
        // Prevent '..' usage
        path = path.replaceAll("../", "");
        path = path.replaceAll("..", "");

        path = this.dirname() + path;

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
        let path = this.fsRestrictPath(_path);
        return fsWriteFileSync(path, content);
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
    read(_path: string) {
        let path = this.fsRestrictPath(_path);
        return fsReadFileSync(path, { encoding: "utf8" });
    },

    /**
     * Deletes a file from path. Please use this instead of `fs.unlinkSync`.
     * 
     * # Examples
     * ```ts
     * delete("/cards/.latestId");
     * // Deletes "(path to folder where Hearthstone.js is)/Hearthstone.js/cards/.latestId"
     * ```
     */
    delete(_path: string) {
        let path = this.fsRestrictPath(_path);
        return fsUnlinkSync(path);
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
        let path = this.fsRestrictPath(_path);
        return fsExistsSync(path);
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
        let dirname = pathDirname(fileURLToPath(import.meta.url)).replaceAll("\\", "/");
        dirname = dirname.split("/dist")[0];

        return dirname;
    },
}
