const rl = require("readline-sync");
const fs = require("fs");
const { Game } = require("./src/game");
const { Player } = require("./src/player");

let decks = Object.values(JSON.parse(fs.readFileSync("decks.json")).versus);

let games = process.env.games || 100;

console.log(`Press enter to play ${games} games`);
if (!process.env.games) console.log("Set the GAMES env variable to change how many games to play.");
console.log("NOTE: If you see no progress being made for an extended period of time, chances are the game got stuck in an infinite loop.");
rl.question();

for (let _ = 0; _ < games; _++) {
    // Test the main game
    const p1 = new Player("Player 1");
    const p2 = new Player("Player 2");
    const game = new Game(p1, p2);

    game.running = true;

    game.functions.importCards(__dirname + '/cards');
    game.functions.importConfig(__dirname + '/config');

    // Setup the ais
    game.config.P1AI = true;
    game.config.P2AI = true;
    game.doConfigAI();

    game.no_input = true;

    // Choose random decks for the players
    for (let i = 0; i < 2; i++) {
        let deck = game.functions.randList(decks);
        game.functions.importDeck(game["player" + (i + 1)], deck);
    }

    game.startGame();
    game.set("dirname", __dirname);

    game.interact.mulligan(p1);
    game.interact.mulligan(p2);

    while (game.running) game.interact.doTurn();
}

console.log("Test passed!");
rl.question();
