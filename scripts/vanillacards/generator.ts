/**
 * Importing this module will reach out to an api and save the result to a file.
 * @module Vanilla Card Generator
 */

import { Axios } from "axios";
import { writeFile } from "fs";
import { createGame } from "../../src/internal.js";

const { game, player1, player2 } = createGame();

function main() {
    new Axios({}).get("https://api.hearthstonejson.com/v1/latest/enUS/cards.json")
        .then(res => {
            let data = JSON.parse(res.data);
            let oldLength = data.length;
            data = game.functions.filterVanillaCards(data, false, false, true);

            writeFile(game.functions.dirname() + "../cardcreator/vanilla/.ignore.cards.json", JSON.stringify(data), err => {
                if (err) throw err;
            });

            let difference = oldLength - data.length;
            game.log(`Found %s cards!\nFiltered away %s cards!\nSuccessfully imported %s cards!`, oldLength, difference, data.length);
        });
}

main();
