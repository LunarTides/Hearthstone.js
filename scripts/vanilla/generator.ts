/**
 * Importing this module will reach out to an api and save the result to a file.
 * @module Vanilla Card Generator
 */

import https from "https";
import { createGame } from "../../src/internal.js";
import { VanillaCard } from "@Game/types.js";

const { game, player1, player2 } = createGame();

// Copy-and-pasted from this stackoverflow answer:
// https://stackoverflow.com/a/62588602
function get(url: string, resolve: (value: unknown) => void, reject: (reason: any) => void) {
    https.get(url, (res) => {
        // if any other status codes are returned, those needed to be added here
        if(res.statusCode === 301 || res.statusCode === 302) {
            if (!res.headers.location) throw new Error("No redirect found. Something must be wrong with the api?");

            return get(res.headers.location, resolve, reject)
        }

        let body: any[] = [];

        res.on("data", (chunk) => {
            body.push(chunk);
        });

        res.on("end", () => {
            try {
                // remove JSON.parse(...) for plain data
                resolve(JSON.parse(Buffer.concat(body).toString()));
            } catch (err) {
                reject(err);
            }
        });
    });
}
async function getData(url: string) {
    return new Promise((resolve, reject) => get(url, resolve, reject));
}

function main() {
    getData("https://api.hearthstonejson.com/v1/latest/enUS/cards.json").then(r => {
        let data = r as VanillaCard[];

        //let data = JSON.parse(r);
        const oldLength = data.length;
        data = game.functions.card.vanilla.filter(data, false, false, true);

        game.functions.file.write("/vanillacards.json", JSON.stringify(data));

        const difference = oldLength - data.length;
        game.log(`Found %s cards!\nFiltered away %s cards!\nSuccessfully imported %s cards!`, oldLength, difference, data.length);

        // If we don't exit, the program never closes for some reason.
        process.exit(0);
    });
}

main();
