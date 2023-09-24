/**
 * Tests that cards works properly. Executes the `test` ability on all cards in its own env.
 * 
 * @module Test Cards
 */

import { Card, Player, createGame } from "../src/internal.js";

const { game, player1, player2 } = createGame();
const cards = game.functions.getCards(false);

function testCard(card: Card): boolean {
    let returnValues = card.activate("test");
    
    // It doesn't have the test ability
    if (returnValues === false) return true;

    // Refund ig
    if (!(returnValues instanceof Array)) return false;

    return returnValues.every(value => !!value);
}

export function main() {
    let success = true;

    cards.forEach(blueprint => {
        // Create a game
        const { game, player1, player2 } = createGame();
        game.setup(player1, player2);
        game.player = player1;
        game.opponent = player2;

        // Assign decks
        const assignDeck = (player: Player) => {
            let deck = game.functions.deckcode.import(player, "Mage /30/ 1");
            if (!deck) throw new Error("Invalid deckcode");

            player.deck = deck;
        }

        game.config.decks.validate = false;
        assignDeck(player1);
        assignDeck(player2);

        game.startGame();

        const card = new Card(blueprint.name, player1);
        
        game.no_output = true;
        let success = testCard(card);
        game.no_output = false;

        if (!success) {
            game.logError(`<red>ERROR: ${card.name} didn't pass its test.</red>`);
            process.exitCode = 1;
            success = false;
        }
    });

    if (success) {
        game.log("<bright:green>All tests passed!</bright:green>");
    }
}

main();
