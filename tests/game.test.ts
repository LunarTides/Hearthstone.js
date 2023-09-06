import { Card, createGame } from "../src/internal";
import { EventValue, GameAttackReturn, Target } from "../src/types";

// Setup the game / copied from the card updater
const { game, player1: test_player1, player2: test_player2 } = createGame();

game.config.P1AI = false;
game.config.P2AI = false;

// Remove functions that clear the screen
game.interact.printName = () => {};
game.interact.printAll = () => {};
game.interact.printLicense = () => {};
game.interact.cls = () => {};

const testCard = () => {
    return new Card("Sheep", test_player1);
}

// Begin testing
describe("Game", () => {
    it ('should update cards', () => {
        const card = testCard();

        game.summonMinion(card, test_player1); // Summon the card so we can update it
        card.abilities.passive = [(plr, game, self, key, _unknownVal) => {
            if (key != "Dummy") return;
            const val = _unknownVal as EventValue<"Dummy">;

            self.displayName = val;
        }];

        game.events.cardUpdate("Eval", "baz"); // This should fail
        expect(card.displayName).not.toBe("baz");

        game.events.cardUpdate("Dummy", "bar"); // This should pass
        expect(card.displayName).toBe("bar");
    });

    it ('should update quests', () => {
        const card = testCard();

        game.functions.addQuest("Quest", test_player1, card, "Dummy", 3, (val, done) => {
            if (!card.storage.quest_progress) card.storage.quest_progress = 0;
            card.storage.quest_progress++;

            if (!done) return true;

            card.storage.quest_done = true;
            return true;
        });

        expect(card.storage.quest_progress).toBeUndefined();

        game.events.questUpdate("quests", "Eval", "bar", test_player1); // This should fail
        expect(card.storage.quest_progress).toBeUndefined();
        expect(card.storage.quest_done).toBeUndefined();

        game.events.questUpdate("quests", "Dummy", "bar", test_player1); // This should pass
        expect(card.storage.quest_progress).toBe(1);
        expect(card.storage.quest_done).toBeUndefined();

        game.events.questUpdate("quests", "Dummy", "bar", test_player1); // This should pass
        expect(card.storage.quest_progress).toBe(2);
        expect(card.storage.quest_done).toBeUndefined();

        game.events.questUpdate("quests", "Dummy", "bar", test_player1); // This should pass
        expect(card.storage.quest_progress).toBe(3);
        expect(card.storage.quest_done).toBeUndefined();
    });

    it ('should broadcast events', () => {
        const card = testCard();
        let quest_added = false;

        card.abilities.passive = [(plr, game, self, key, val) => {
            if (key != "Eval" || quest_added) return; // Only add the quest if the key is 'pass' and the quest does not already exist
            quest_added = true;

            game.functions.addQuest("Quest", test_player1, card, "Dummy", 3, (val, done) => {
                if (!card.storage.quest_progress) card.storage.quest_progress = 0;
                card.storage.quest_progress++;

                if (!done) return true;

                card.storage.quest_done = true;
                return true;
            });
        }];
        game.summonMinion(card, test_player1);

        expect(card.storage.quest_progress).toBeUndefined();

        game.events.broadcast("GameLoop", "bar", test_player1); // This should fail
        expect(card.storage.quest_progress).toBeUndefined();
        expect(card.storage.quest_done).toBeUndefined();

        game.events.broadcast("Dummy", "bar", test_player1); // This should not do anything since the quest isn't added yet
        expect(card.storage.quest_progress).toBeUndefined();
        expect(card.storage.quest_done).toBeUndefined();

        game.events.broadcast("Eval", "bar", test_player1); // This should pass and add the test
        expect(card.storage.quest_progress).toBeUndefined();
        expect(card.storage.quest_done).toBeUndefined();

        game.events.broadcast("Dummy", "bar", test_player1); // This should pass
        expect(card.storage.quest_progress).toBe(1);
        expect(card.storage.quest_done).toBeUndefined();

        game.events.broadcast("Dummy", "bar", test_player1); // This should pass
        expect(card.storage.quest_progress).toBe(2);
        expect(card.storage.quest_done).toBeUndefined();

        game.events.broadcast("Dummy", "bar", test_player1); // This should pass
        expect(card.storage.quest_progress).toBe(3);
        expect(card.storage.quest_done).toBe(true);
    });

    it ('should increment a stat', () => {
        expect(game.events.stats.TestStat).toBeUndefined();

        game.events.increment(test_player1, "TestStat");
        expect(game.events.stats.TestStat[test_player1.id]).toBe(1);

        game.events.increment(test_player1, "TestStat", 2);
        expect(game.events.stats.TestStat[test_player1.id]).toBe(3);
    });

    // We don't test game.input

    it ('should assign ai\'s to players', () => {
        game.config.P1AI = true;
        game.config.P2AI = true;
        game.doConfigAI();

        expect(test_player1.ai).not.toBeNull();
        expect(test_player2.ai).not.toBeNull();

        game.config.P1AI = false;
        game.config.P2AI = false;
        game.doConfigAI();

        expect(test_player1.ai).toBeNull();
        expect(test_player2.ai).toBeNull();
    });

    it ('should correctly trigger event listeners', () => {
        let ret: string | null = null;

        game.functions.addEventListener("Eval", (_unknownVal) => {
            const val = _unknownVal as EventValue<"Eval">;

            return val == "foo";
        }, (_unknownVal) => {
            const val = _unknownVal as EventValue<"Eval">;

            ret = val;
            return true;
        });

        expect(ret).toBeNull();

        game.events.broadcast("Dummy", "foo", test_player1); // This will fail
        expect(ret).toBeNull();

        game.events.broadcast("Eval", "bar", test_player1); // This will fail since the value is 'bar' instead of 'foo'
        expect(ret).toBeNull();

        game.events.broadcast("Eval", "foo", test_player1); // This will pass
        expect(ret).toBe("foo");
    });

    it ('should correctly play a minion', () => {
        const card = testCard();
        card.type == "Minion";

        let result;

        // Not enough mana
        test_player1.mana = 10;
        card.mana = 100;

        result = game.playCard(card, test_player1);
        expect(result).toBe("mana");

        // Traded
        card.addKeyword("Tradeable");
        game.player = test_player1;
        test_player1.inputQueue = "y"; // Force the player to trade the card
        result = game.playCard(card, test_player1);

        expect(result).toBe("traded");

        // Undo the trade
        test_player1.drawSpecific(card);
        test_player1.inputQueue = "n"; // Force the player to NOT trade the card
        result = game.playCard(card, test_player1); // The card still costs 100 mana

        expect(result).toBe("mana");

        // Undo all
        card.mana = 0;
        test_player1.inputQueue = undefined;
        card.removeKeyword("Tradeable");

        // Not enough space
        game.board = [[], []]; // Clear the board
        game.config.maxBoardSpace = 0;

        result = game.playCard(card, test_player1);
        expect(result).toBe("space");

        game.config.maxBoardSpace = 7;

        // Magnetized
        card.addKeyword("Magnetic");

        let mech = card.imperfectCopy();
        mech.tribe = "Mech";

        result = game.summonMinion(mech, test_player1);
        expect(result).toBe(mech); // This should succeed

        test_player1.forceTarget = mech;
        result = game.playCard(card, test_player1);
        test_player1.forceTarget = undefined;
        expect(result).toBe("magnetize");

        card.removeKeyword("Magnetic");

        // Success
        expect(card.storage.foo).toBeUndefined();

        card.abilities.battlecry = [(plr, game, self) => {
            self.storage.foo = "bar";
        }];

        result = game.playCard(card, test_player1);
        expect(result).toBe(card);

        expect(card.storage.foo).toBe("bar");
    });
    it ('should correctly play a spell', () => {
        const card = testCard();
        card.type = "Spell";

        card.mana = 0;

        card.abilities.cast = [(plr, game, self) => {
            self.storage.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        expect(result).toBe(true);

        expect(card.storage.foo).toBe("bar");
    });
    it ('should correctly play a weapon', () => {
        const card = testCard();
        card.type = "Weapon";

        card.mana = 0;

        card.abilities.battlecry = [(plr, game, self) => {
            self.storage.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        expect(result).toBe(true);

        expect(card.storage.foo).toBe("bar");
    });
    it ('should correctly play a hero card', () => {
        const card = testCard();
        card.type = "Hero";

        card.mana = 0;

        card.abilities.battlecry = [(plr, game, self) => {
            self.storage.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        expect(result).toBe(true);

        expect(card.storage.foo).toBe("bar");
        expect(test_player1.hero).toBe(card);
    });
    it ('should correctly play a location card', () => {
        const card = testCard();
        card.type = "Location";

        card.mana = 0;

        card.abilities.use = [(plr, game, self) => {
            self.storage.foo = "bar";
        }];

        // Success
        let result = game.playCard(card, test_player1);
        expect(result).toBe(true);

        expect(card.storage.foo).toBeUndefined();
        expect(card.cooldown).toBe(0); // It's cooldown should be 0

        let stats = card.stats;
        expect(stats).toBeDefined();

        stats = stats!;

        game.player.forceTarget = card;
        game.interact.useLocation();
        game.player.forceTarget = undefined;

        expect(card.storage.foo).toBe("bar");
        expect(card.getHealth()).toBe(stats[1] - 1); // It's durability should have decreased by 1
        expect(card.cooldown).toBe(card.backups.init.cooldown); // It's cooldown should have reset
    });

    it ('should correctly summon a minion', () => {
        const card = testCard();
        card.type == "Minion";

        let result;

        card.mana = 0;

        expect(card.storage.foo).toBeUndefined();

        card.abilities.battlecry = [(plr, game, self) => {
            self.storage.foo = "bar";
        }];

        expect(game.board[test_player1.id]).toEqual(expect.not.arrayContaining([card])); // The minion shouldn't be on the board

        result = game.summonMinion(card, test_player1);
        expect(result).toBe(card);

        expect(card.storage.foo).toBeUndefined();
        expect(game.board[test_player1.id]).toEqual(expect.arrayContaining([card])); // The minion should be on the board
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

        let attacker: Target | number;
        let target: Target;

        let taunt;

        function testAttack(result: GameAttackReturn) {
            // This function tries to attack the attacker with the target, then tests the result of that attack against `result`
            game.player = test_player1;
            game.opponent = test_player2;

            let res = game.attack(attacker, target);

            expect(res).toBe(result);
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

        expect(game.board[test_player1.id]).toEqual(expect.arrayContaining([card])); // The minion should be on the board

        game.killMinions();
        expect(game.board[test_player1.id]).toEqual(expect.not.arrayContaining([card])); // The minion shouldn't be on the board

        // Reborn
        card.setStats(1, 1);
        game.summonMinion(card, test_player1);

        card.addKeyword("Reborn");
        card.remHealth(1);

        game.killMinions();

        let c = game.board[test_player1.id].find(c => c.name == card.name);
        expect(c).toBeDefined();

        c = c!;

        expect(c.name).toBe(card.name); // The minion should still be on the board
        expect(c.keywords).toEqual(expect.not.arrayContaining(["Reborn"]));
        expect(c.getHealth()).toBe(1);
    });
});
