/**
 * Tests that cards works properly. Executes the `test` ability on all cards in its own env.
 *
 * @module Test Cards
 */

import process from 'node:process';
import { Card, type Player, createGame } from '../src/internal.js';

const { game } = createGame();
const cards = game.functions.card.getAll(false);

function testCard(card: Card): boolean | Error {
    try {
        card.activate('test');
    } catch (error) {
        if (error instanceof Error) {
            return error;
        }
    }

    return true;
}

export function main() {
    let failed = false;

    for (const blueprint of cards) {
        // Create a game
        const { game, player1, player2 } = createGame();
        game.config.ai.player1 = false;
        game.config.ai.player2 = false;
        game.doConfigAi();

        game.setup(player1, player2);
        game.player = player1;
        game.opponent = player2;

        // Assign decks
        const assignDeck = (player: Player) => {
            const deck = game.functions.deckcode.import(player, 'Mage /30/ 1');
            if (!deck || deck.length <= 0) {
                throw new Error('Invalid deckcode');
            }

            player.deck = deck;
        };

        game.config.decks.validate = false;
        assignDeck(player1);
        assignDeck(player2);

        game.startGame();

        const card = new Card(blueprint.id, player1);

        game.noOutput = true;
        const error = testCard(card);
        game.noOutput = false;

        if (error instanceof Error) {
            game.logError(`<red>ERROR: ${card.name} (${card.id}) didn't pass its test. Here is the error. THIS ERROR IS PART OF THE SCRIPT, NOT AN ACTUAL ERROR.</red>`);
            game.logError(error.stack);
            game.logError();
            process.exitCode = 1;
            failed = true;
        }
    }

    if (!failed) {
        game.log('<bright:green>All tests passed!</bright:green>');
    }
}

main();
