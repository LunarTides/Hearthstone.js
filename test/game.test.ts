import "colors";
import assert from 'assert';
import { Player, Game, set } from "../src/internal.js";

// Setup the game / copied from the card updater
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");

const game = new Game(test_player1, test_player2);
set(game);

const functions = game.functions;

functions.importCards(__dirname + "/../cards");
functions.importConfig(__dirname + "/../config");

game.config.P1AI = false;
game.config.P2AI = false;

// Remove functions that clear the screen
game.interact.printName = () => {};
game.interact.printAll = () => {};
game.interact.printLicense = () => {};
game.interact.cls = () => {};

const testCard = () => {
    return new game.Card("Sheep", test_player1);
}

// Begin testing
describe("Game", () => {
    beforeEach(() => {
        set(game);
    });

    it ('should update cards', () => {
        const card = testCard();

        game.summonMinion(card, test_player1); // Summon the card so we can update it
        card.passive = [(plr, game, self, key, val) => {
            if (key != "pass") return;

            self.foo = val;
        }];

        game.events.cardUpdate("fail", "baz"); // This should fail
        assert.notEqual(card.foo, "baz");

        game.events.cardUpdate("pass", "bar"); // This should pass
        assert.equal(card.foo, "bar");
    });

    it ('should update quests', () => {
        const card = testCard();

        functions.addQuest("Quest", test_player1, card, "pass", 3, (val, turn, done) => {
            if (!card.quest_progress) card.quest_progress = 0;
            card.quest_progress++;

            if (!done) return;

            card.quest_done = true;
        });

        assert.equal(card.quest_progress, undefined);

        game.events.questUpdate("quests", "fail", "bar", test_player1); // This should fail
        assert.equal(card.quest_progress, undefined);
        assert.equal(card.quest_done, undefined);

        game.events.questUpdate("quests", "pass", "bar", test_player1); // This should pass
        assert.equal(card.quest_progress, 1);
        assert.equal(card.quest_done, undefined);

        game.events.questUpdate("quests", "pass", "bar", test_player1); // This should pass
        assert.equal(card.quest_progress, 2);
        assert.equal(card.quest_done, undefined);

        game.events.questUpdate("quests", "pass", "bar", test_player1); // This should pass
        assert.equal(card.quest_progress, 3);
        assert.equal(card.quest_done, true);
    });

    it ('should broadcast events', () => {
        const card = testCard();
        let quest_added = false;

        card.passive = [(plr, game, self, key, val) => {
            if (key != "pass" || quest_added) return; // Only add the quest if the key is 'pass' and the quest does not already exist
            quest_added = true;

            functions.addQuest("Quest", test_player1, card, "questpass", 3, (val, turn, done) => {
                if (!card.quest_progress) card.quest_progress = 0;
                card.quest_progress++;

                if (!done) return;

                card.quest_done = true;
            });
        }];
        game.summonMinion(card, test_player1);

        assert.equal(card.quest_progress, undefined);

        game.events.broadcast("fail", "bar", test_player1); // This should fail
        assert.equal(card.quest_progress, undefined);
        assert.equal(card.quest_done, undefined);

        game.events.broadcast("questpass", "bar", test_player1); // This should not do anything since the quest isn't added yet
        assert.equal(card.quest_progress, undefined);
        assert.equal(card.quest_done, undefined);


        game.events.broadcast("pass", "bar", test_player1); // This should pass and add the test
        assert.equal(card.quest_progress, undefined);
        assert.equal(card.quest_done, undefined);

        game.events.broadcast("questpass", "bar", test_player1); // This should pass
        assert.equal(card.quest_progress, 1);
        assert.equal(card.quest_done, undefined);

        game.events.broadcast("questpass", "bar", test_player1); // This should pass
        assert.equal(card.quest_progress, 2);
        assert.equal(card.quest_done, undefined);

        game.events.broadcast("questpass", "bar", test_player1); // This should pass
        assert.equal(card.quest_progress, 3);
        assert.equal(card.quest_done, true);
    });

    it ('should increment a stat', () => {
        assert.equal(game.events.TestStat, undefined);

        game.events.increment(test_player1, "TestStat");
        assert.equal(game.events.TestStat[test_player1.id], 1);

        game.events.increment(test_player1, "TestStat", 2);
        assert.equal(game.events.TestStat[test_player1.id], 3);
    });

    // We don't test game.input

    it ('should assign ai\'s to players', () => {
        game.config.P1AI = true;
        game.config.P2AI = true;
        game.doConfigAI();

        assert.notEqual(test_player1.ai, null);
        assert.notEqual(test_player2.ai, null);

        game.config.P1AI = false;
        game.config.P2AI = false;
        game.doConfigAI();

        assert.equal(test_player1.ai, null);
        assert.equal(test_player2.ai, null);
    });

    it ('should correctly trigger event listeners', () => {
        let ret = null;

        game.functions.addEventListener("pass", (val) => {
            return val == "foo";
        }, (val) => {
            ret = val;
        });

        assert.equal(ret, null);

        game.events.broadcast("fail", "foo", test_player1); // This will fail
        assert.equal(ret, null);

        game.events.broadcast("pass", "bar", test_player1); // This will fail since the value is 'bar' instead of 'foo'
        assert.equal(ret, null);

        game.events.broadcast("pass", "foo", test_player1); // This will pass
        assert.equal(ret, "foo");
    });

    it ('should correctly play a minion', () => {
        const card = testCard();
        card.type == "Minion";

        let result;

        // Not enough mana
        test_player1.mana = 10;
        card.mana = 100;

        result = game.playCard(card, test_player1);
        assert.equal(result, "mana");

        // Traded
        card.addKeyword("Tradeable");
        game.player = test_player1;
        test_player1.inputQueue = "y"; // Force the player to trade the card
        result = game.playCard(card, test_player1);

        assert.equal(result, "traded");

        // Undo the trade
        test_player1.drawSpecific(card);
        test_player1.inputQueue = "n"; // Force the player to NOT trade the card
        result = game.playCard(card, test_player1); // The card still costs 100 mana

        assert.equal(result, "mana");

        // Undo all
        card.mana = 0;
        test_player1.inputQueue = null;
        card.removeKeyword("Tradeable");

        // Not enough space
        game.board = [[], []]; // Clear the board
        game.config.maxBoardSpace = 0;

        result = game.playCard(card, test_player1);
        assert.equal(result, "space");

        game.config.maxBoardSpace = 7;

        // Magnetized
        card.addKeyword("Magnetic");

        let mech = card.imperfectCopy();
        mech.tribe = "Mech";

        result = game.summonMinion(mech, test_player1);
        assert.equal(result, mech); // This should succeed

        test_player1.forceTarget = mech;
        result = game.playCard(card, test_player1);
        test_player1.forceTarget = null;

        assert.equal(result, "magnetize");

        card.removeKeyword("Magnetic");

        // Success
        assert.equal(card.foo, undefined);

        card.battlecry = [(plr, game, self) => {
            self.foo = "bar";
        }];

        result = game.playCard(card, test_player1);
        assert.equal(result, card);

        assert.equal(card.foo, "bar");
    });
    it ('should correctly play a spell', () => {
        const card = testCard();
        card.type = "Spell";

        card.mana = 0;

        card.cast = [(plr, game, self) => {
            self.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        assert.equal(result, true);

        assert.equal(card.foo, "bar");
    });
    it ('should correctly play a weapon', () => {
        const card = testCard();
        card.type = "Weapon";

        card.mana = 0;

        card.battlecry = [(plr, game, self) => {
            self.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        assert.equal(result, true);

        assert.equal(card.foo, "bar");
    });
    it ('should correctly play a hero card', () => {
        const card = testCard();
        card.type = "Hero";

        card.mana = 0;

        card.battlecry = [(plr, game, self) => {
            self.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        assert.equal(result, true);

        assert.equal(card.foo, "bar");
        assert.equal(test_player1.hero, card);
    });
    it ('should correctly play a location card', () => {
        const card = testCard();
        card.type = "Location";

        card.mana = 0;

        card.use = [(plr, game, self) => {
            self.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        assert.equal(result, card);

        assert.equal(card.foo, undefined);
        assert.equal(card.cooldown, 0); // It's cooldown should be 0

        const stats = card.stats;

        game.player.forceTarget = card;
        game.interact.useLocation();
        game.player.forceTarget = null;

        assert.equal(card.foo, "bar");
        assert.equal(card.getHealth(), stats[1] - 1); // It's durability should have decreased by 1
        assert.equal(card.cooldown, card.backups.init.cooldown); // It's cooldown should have reset
    });

    it ('should correctly summon a minion', () => {
        const card = testCard();
        card.type == "Minion";

        let result;

        card.mana = 0;

        assert.equal(card.foo, undefined);

        card.battlecry = [(plr, game, self) => {
            self.foo = "bar";
        }];

        assert.ok(!game.board[test_player1.id].find(c => c == card)); // The minion shouldn't be on the board

        result = game.summonMinion(card, test_player1);
        assert.equal(result, card);

        assert.equal(card.foo, undefined);
        assert.ok(game.board[test_player1.id].find(c => c == card)); // The minion should be on the board
    });

    it ('should correctly attack', () => {
        // Prepare for the longest function ever. I tried to make it organized.
        //
        // Just a list of the possible options i wrote as reference.
        // Attacker: Card | Player
        // Target:   Card | Player
        //
        // Returns: Success | "divineshield" | "taunt" | "stealth" | "frozen" | "plrnoattack" | "noattack" | "hasattacked" | "sleepy" | "cantattackhero" | "immune"
        // Order: "immune", "sleepy", "noattack", "frozen", "stealth", "divineshield", "hasattacked", "taunt", "cantattackhero", "plrnoattack", Success

        // -- SETTING UP --
        game.player = test_player1;

        let attacker;
        let target;

        let taunt;

        function testAttack(result) {
            // This function tries to attack the attacker with the target, then tests the result of that attack against `result`
            game.player = test_player1;
            game.opponent = test_player2;

            let res = game.attack(attacker, target);

            assert.equal(res, result);
        }

        // -- THE ATTACKER IS A CARD --
        attacker = testCard();
        attacker.plr = test_player1;
        game.summonMinion(attacker, test_player1);

        // -- THE TARGET IS A CARD --
        target = testCard();
        target.plr = test_player2;
        game.summonMinion(target, test_player2);

        // First go for "immune"
        target.immune = true;
        testAttack("immune");
        target.immune = false;

        // Now go for sleepy
        attacker.sleepy = true;
        testAttack("sleepy");
        attacker.sleepy = false;

        // Now go for noattack
        attacker.setStats(0, 1);
        testAttack("noattack");
        attacker.setStats(1, 1);

        // Now go for frozen
        attacker.freeze();
        testAttack("frozen");
        attacker.frozen = false;

        // Now go for stealth
        target.addKeyword("Stealth");
        testAttack("stealth");
        target.removeKeyword("Stealth");

        // Now go for hasattacked
        attacker.attackTimes = 0;
        testAttack("hasattacked");
        attacker.attackTimes = 1;

        // Now go for taunt
        taunt = testCard();
        taunt.plr = test_player2;
        taunt.addKeyword("Taunt");
        game.summonMinion(taunt, test_player2);

        testAttack("taunt");

        taunt.destroy();

        // Now got for success
        testAttack(true);

        // -- THE TARGET IS A PLAYER --
        attacker.destroy();

        attacker = testCard();
        attacker.plr = test_player1;
        game.summonMinion(attacker, test_player1);

        target = test_player2;

        // First go for "immune"
        target.immune = true;
        testAttack("immune");
        target.immune = false;

        // Now go for sleepy
        attacker.sleepy = true;
        testAttack("sleepy");
        attacker.sleepy = false;

        // Now go for noattack
        attacker.setStats(0, 1);
        testAttack("noattack");
        attacker.setStats(1, 1);

        // Now go for frozen
        attacker.freeze();
        testAttack("frozen");
        attacker.frozen = false;

        // Now go for hasattacked
        attacker.attackTimes = -1;
        testAttack("hasattacked");
        attacker.attackTimes = 1;

        // Now go for cantattackhero
        attacker.canAttackHero = false;
        testAttack("cantattackhero");
        attacker.canAttackHero = true;

        // Now go for taunt
        taunt = testCard();
        taunt.plr = test_player2;
        taunt.addKeyword("Taunt");
        game.summonMinion(taunt, test_player2);

        testAttack("taunt");

        taunt.destroy();

        // Now got for success
        attacker.attackTimes = 1;
        testAttack(true);

        // -- THE ATTACKER IS A PLAYER --
        attacker = test_player1;
        attacker.attack = 1;

        // -- THE TARGET IS A CARD --
        target = testCard();
        target.plr = test_player2;
        game.summonMinion(target, test_player2);

        // First go for "immune"
        target.immune = true;
        testAttack("immune");
        target.immune = false;

        // Now go for noattack
        attacker.attack = 0;
        testAttack("plrnoattack");
        attacker.attack = 1;

        // Now go for hasattacked
        attacker.canAttack = false;
        testAttack("plrhasattacked");
        attacker.canAttack = true;

        // Now go for frozen
        attacker.frozen = true;
        testAttack("frozen");
        attacker.frozen = false;

        // Now go for stealth
        target.addKeyword("Stealth");
        testAttack("stealth");
        target.removeKeyword("Stealth");

        // Now go for taunt
        taunt = testCard();
        taunt.plr = test_player2;
        taunt.addKeyword("Taunt");
        game.summonMinion(taunt, test_player2);

        testAttack("taunt");

        taunt.destroy();

        // Now got for success
        testAttack(true);

        // -- THE TARGET IS A PLAYER --
        target = test_player2;

        // First go for "immune"
        target.immune = true;
        testAttack("immune");
        target.immune = false;

        // Now go for noattack
        attacker.attack = 0;
        testAttack("plrnoattack");
        attacker.attack = 1;

        // Now go for hasattacked
        attacker.canAttack = false;
        testAttack("plrhasattacked");
        attacker.canAttack = true;

        // Now go for frozen
        attacker.frozen = true;
        testAttack("frozen");
        attacker.frozen = false;

        // Now go for taunt
        taunt = testCard();
        taunt.plr = test_player2;
        taunt.addKeyword("Taunt");
        game.summonMinion(taunt, test_player2);

        testAttack("taunt");

        taunt.destroy();

        // Now got for success
        testAttack(true);

        // -- THE ATTACKER IS A NUMBER --
        attacker = 1;

        // -- THE TARGET IS A CARD --
        target = testCard();
        target.plr = test_player2;
        game.summonMinion(target, test_player2);

        // First go for "immune"
        target.immune = true;
        testAttack("immune");
        target.immune = false;

        // Now go for divineshield | Divine shield only gets returned if the attacker is a number
        target.addKeyword("Divine Shield");
        testAttack("divineshield"); // I don't need to undo the divine shield since it gets broken anyways

        // Now got for success
        testAttack(true);

        // -- THE TARGET IS A PLAYER --
        target = test_player2;

        // First go for "immune"
        target.immune = true;
        testAttack("immune");
        target.immune = false;

        // Now got for success
        testAttack(true);
    });

    it ('should correctly kill minions', () => {
        const card = testCard();

        game.board = [[], []];

        game.summonMinion(card, test_player1);
        card.remHealth(1000);

        assert.ok(game.board[test_player1.id].find(c => c == card)); // The minion should be on the board

        game.killMinions();
        assert.ok(!game.board[test_player1.id].find(c => c == card)); // The minion shouldn't be on the board

        // Reborn
        card.setStats(1, 1);
        game.summonMinion(card, test_player1);

        card.addKeyword("Reborn");
        card.remHealth(1);

        game.killMinions();

        const c = game.board[test_player1.id].find(c => c.name == card.name);
        assert.equal(c.name, card.name); // The minion should be on the board
        assert.ok(!c.keywords.includes("Reborn"));
        assert.equal(c.getHealth(), 1);
    });
});
