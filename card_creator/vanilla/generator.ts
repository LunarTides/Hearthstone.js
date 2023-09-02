import { Axios } from "axios";
import { writeFile } from "fs";
import { Game, Player } from "../../src/internal.js";

const game = new Game();
const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
game.setup(player1, player2);
game.functions.importCards(game.functions.dirname() + "cards");
game.functions.importConfig(game.functions.dirname() + "config");

new Axios({}).get("https://api.hearthstonejson.com/v1/latest/enUS/cards.json")
    .then(res => {
        let data = JSON.parse(res.data);
        let oldLength = data.length;
        data = game.functions.filterVanillaCards(data, false, false, true);

        writeFile(".ignore.cards.json", JSON.stringify(data), err => {
            if (err) throw err;
        });
        console.log(`Found ${oldLength} cards!\nFiltered away ${oldLength - data.length} cards!\nSuccessfully imported ${data.length} cards!`);
    });