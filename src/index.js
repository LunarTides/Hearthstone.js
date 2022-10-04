/*
Hearthstone.js - Hearthstone but console based.
Copyright (C) 2022  Keatpole

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const fs = require("fs");
const { question } = require("readline-sync");
const { exit } = require('process');
const { Game } = require("./game");
const { Card, setup_card } = require("./card");
const { Player, setup_other } = require("./other");
const { doTurn, printName, setup_interact } = require("./interact");

const _debug = true; // Enables commands like /give, /class and /eval. Disables naming players.
                     // Enable for debugging, disable for actual play.

var cards = {};

function importCards(path) {
    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        if (file.name.endsWith(".js")) {
            var f = require(`${path}/${file.name}`);
            cards[f.name] = f;
        } else if (file.isDirectory()) {
            importCards(`${path}/${file.name}`);
        }
    });
}

importCards(__dirname + '/../cards');

let game;
let player1;
let player2;

function setup_game() {
    player1 = new Player("Isak");
    player2 = new Player("Sondre")

    if (!_debug) {
        player1.setName(question("\nPlayer 1, what is your name? "));
        player2.setName(question("Player 2, what is your name? "));
    }

    game = new Game(player1, player2);
}
function validateDeck(card, plr, deck) {
    if (deck.length > 30) return false;
    return validateCard(card, plr);
}
function validateCard(card, plr) {
    if (plr.class != card.class && card.class != "Neutral") return false;
    return true;
}

function importDeck(code, plr) {
    // The code is base64 encoded, so we need to decode it
    code = Buffer.from(code, 'base64').toString('ascii');
    let deck = code.split(", ");
    let _deck = [];

    let changed_class = false;

    // Find all cards with "x2" in front of them, and remove it and add the card twice
    for (let i = 0; i < deck.length; i++) {
        let card = deck[i];

        let m = null;

        if (card.startsWith("x2 ")) {
            let m1 = new Card(game.functions.getCardByName(card.substring(3)).name, plr);
            let m2 = new Card(game.functions.getCardByName(card.substring(3)).name, plr);
            m = m1;

            _deck.push(m1, m2);
        } else {
            m = new Card(game.functions.getCardByName(card).name, plr);

            _deck.push(m);
        }

        if (!changed_class) {
            plr.setClass(m.class);
        
            changed_class = true;
        }

        if (!validateDeck(m, plr, _deck)) {
            console.log("The Deck is not valid")
            exit(1);
        }
    }

    return game.functions.shuffle(_deck);
}

printName();

setup_game();
setup_card(cards, game);
setup_interact(game, _debug);
setup_other(cards, game);
game.set("cards", cards);

printName();
const deckcode1 = game.input("\nPlayer 1, please type in your deckcode (Leave this empty for a test deck): ");
printName();
const deckcode2 = game.input("\nPlayer 2, please type in your deckcode (Leave this empty for a test deck): ");

if (deckcode1.length > 0) {
    player1.deck = importDeck(deckcode1, player1);
} else {
    while (player1.getDeck().length < 30) player1.deck.push(new Card("Sheep", player1));
}
if (deckcode2.length > 0) {
    player2.deck = importDeck(deckcode2, player2);
} else {
    while (player2.getDeck().length < 30) player2.deck.push(new Card("Sheep", player2));
}

game.startGame();

while (true) doTurn();