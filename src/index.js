/*
Hearthstone.js - Hearthstone but console based.
Copyright (C) 2022  Keatpole
*/

const { readdirSync } = require("fs");
const { question } = require("readline-sync");

const { Game } = require("./game");
const { setup_card } = require("./card");
const { setup_interact } = require("./interact");
const { Player, setup_other } = require("./other");

const _debug = true; // Enables commands like /give and /eval. Disables naming players.
                     // Enable for debugging, disable for actual play.
const maxDeckLength = 30;

let cards = {};

let player1 = new Player("Player 1");
let player2 = new Player("Player 2");
let game = new Game(player1, player2);

if (!_debug) {
    player1.name = question("\nPlayer 1, what is your name? ");
    player2.name = question("Player 2, what is your name? ");
}

function importCards(path) {
    readdirSync(path, { withFileTypes: true }).forEach(file => {
        if (file.name.endsWith(".js")) {
            let f = require(`${path}/${file.name}`);
            cards[f.name] = f;
        } else if (file.isDirectory()) {
            importCards(`${path}/${file.name}`);
        }
    });
}
importCards(__dirname + '/../cards');

game.set("cards", cards);
setup_card(cards, game);
setup_interact(_debug, maxDeckLength);
setup_other(cards, game);

game.interact.deckCode(player1);
game.interact.deckCode(player2);

game.startGame();

while (true) game.interact.doTurn();