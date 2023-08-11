//@ts-check
let axios = require("axios");
let fs = require("fs");
const { Game } = require("../../src/game");

const game = new Game({}, {});
game.functions.importCards(__dirname + "/../../cards");
game.functions.importConfig(__dirname + "/../../config");

axios.get("https://api.hearthstonejson.com/v1/latest/enUS/cards.json")
    .then(res => {
        let data = game.functions.filterVanillaCards(res.data, false, false, true);

        fs.writeFile(__dirname + "/.ignore.cards.json", JSON.stringify(data), err => {
            if (err) throw err;
        });
        console.log(`Found ${res.data.length} cards!\nFiltered away ${res.data.length - data.length} cards!\nSuccessfully imported ${data.length} cards!`);
    });
