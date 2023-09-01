import rl from "readline-sync";
import { readFileSync } from "fs";
import { Game, Player } from "../src/internal.js";

let decksString = readFileSync("../decks.json", { encoding: 'utf8', flag: 'r' });
let decks: string[] = Object.values(JSON.parse(decksString).versus);

let gamesEnv = process.env.games ?? "";
let games = parseInt(gamesEnv) ?? 100;

console.warn(`Press enter to play ${games} games`);
if (!process.env.games) console.log("Set the GAMES env variable to change how many games to play.");
console.log("NOTE: If you see no progress being made for an extended period of time, chances are the game got stuck in an infinite loop.");
rl.question();

for (let index = 0; index < games; index++) {
    // If you're redirecting output to a file, show a progress bar
    if (!process.stdout.isTTY) process.stderr.write(`\r\x1b[KPlaying game #${index + 1} / ${games}...`);

    // Test the main game
    const game = new Game();
    const p1 = new Player("Player 1");
    const p2 = new Player("Player 2");
    game.setup(p1, p2);

    game.functions.importCards('../cards');
    game.functions.importConfig('../config');

    // Setup the ais
    game.config.P1AI = true;
    game.config.P2AI = true;
    game.doConfigAI();

    game.no_input = true;

    // Choose random decks for the players
    for (let i = 0; i < 2; i++) {
        let plr;
        if (i === 0) plr = game.player1;
        else plr = game.player2;

        let deck = game.functions.randList(decks);
        if (typeof deck === "string") game.functions.deckcode.import(plr, deck);
    }

    game.startGame();
    game.interact.mulligan(p1);
    game.interact.mulligan(p2);

    try {
        while (game.running) game.interact.doTurn();
    } catch(err) {
        // If it crashes, show the ai's actions, and the history of the game before actually crashing
        game.config.debug = true;
        game.functions.createLogFile(err);

        game.interact.handleCmds("/ai");
        game.interact.handleCmds("history", true, true);

        console.log("THE GAME CRASHED: LOOK ABOVE FOR THE HISTORY, AND THE AI'S LOGS.");

        throw err;
    }
}

console.warn("Test passed!");
rl.question();
