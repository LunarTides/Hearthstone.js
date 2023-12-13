/**
 * The crash test script.
 * @module Crash Test
 */
import process from 'node:process';
import { createGame } from '../src/internal.js';

const gamesEnv = process.env.games ?? '';
const games = game.lodash.parseInt(gamesEnv) ?? 100;

function main(): void {
    const decks = JSON.parse(game.functions.util.fs('read', '/decks.json') as string) as string[];

    console.warn(`Press enter to play ${games} games`);
    if (!process.env.games) {
        console.log('Set the GAMES env variable to change how many games to play.');
    }

    console.log('NOTE: If you see no progress being made for an extended period of time, chances are the game got stuck in an infinite loop.');
    game.pause();

    for (let index = 0; index < games; index++) {
        // If you're redirecting output to a file, show a progress bar
        if (!process.stdout.isTTY) {
            process.stderr.write(`\r\u001B[KPlaying game #${index + 1} / ${games}...`);
        }

        // Test the main game
        const { game, player1, player2 } = createGame();

        // Setup the ais
        game.config.ai.player1 = true;
        game.config.ai.player2 = true;
        game.doConfigAi();

        game.noInput = true;

        // Choose random decks for the players
        for (let i = 0; i < 2; i++) {
            const player = game.functions.util.getPlayerFromId(i);

            const deck = game.lodash.sample(decks);
            if (typeof deck === 'string') {
                game.functions.deckcode.import(player, deck);
            }
        }

        game.startGame();
        game.interact.card.mulligan(player1);
        game.interact.card.mulligan(player2);

        try {
            while (game.running) {
                game.interact.gameLoop.doTurn();
            }
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new TypeError('error is not of error type');
            }

            // If it crashes, show the ai's actions, and the history of the game before actually crashing
            game.config.general.debug = true;
            game.functions.util.createLogFile(error);

            game.interact.gameLoop.handleCmds('/ai');
            game.interact.gameLoop.handleCmds('history', { debug: true });

            console.log('THE GAME CRASHED: LOOK ABOVE FOR THE HISTORY, AND THE AI\'S LOGS.');

            throw error;
        }
    }

    console.warn('Test passed!');
    game.pause();
}

main();
