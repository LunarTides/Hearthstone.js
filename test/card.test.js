const assert = require('assert');
const colors = require("colors");
const { Player } = require("../src/player");
const { Game } = require("../src/game");
const { set } = require("../src/shared");

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
describe("Card", () => {
    it ('should correctly create a card', () => {
        const card = testCard();

        assert.equal(card.name, "Sheep");
    });

    it ('should correctly randomize uuid', () => {
        const card = testCard();
        const uuid = card.uuid;

        card.randomizeUUID();

        assert.notEqual(card.uuid, uuid);
    });

    it ('should correctly add a deathrattle', () => {
        const card = testCard();

        card.addDeathrattle((plr, game, self) => {
            self.foo = "bar";
        });

        card.activate("deathrattle");

        assert.equal(card.foo, "bar");
    });

    it ('should correctly add a keyword', () => {
        const card = testCard();

        card.addKeyword("Taunt");

        assert.equal(card.keywords[0], "Taunt");
    });

    it ('should correctly remove a keyword', () => {
        const card = testCard();

        card.addKeyword("Taunt");
        card.removeKeyword("Taunt");

        assert.equal(card.keywords.length, 0);
    });

    it ('should correctly freeze a minion', () => {
        const card = testCard();

        card.freeze();

        assert.equal(card.frozen, true);
    });

    it ('should correctly decrease a minion\'s attack', () => {
        const card = testCard();

        card.ready();
        card.decAttack();

        assert.equal(card.attackTimes, 0);
        assert.equal(card.sleepy, true);
    });

    it ('should ready a minion', () => {
        const card = testCard();

        card.ready();

        assert.equal(card.attackTimes, 1);
        assert.equal(card.sleepy, false);
    });

    it ('should correctly get/set the attack of a minion', () => {
        const card = testCard();

        card.setStats(2, 3);

        assert.equal(card.getAttack(), 2);
    });

    it ('should correctly get/set the health of a minion', () => {
        const card = testCard();

        card.setStats(2, 3);

        assert.equal(card.getHealth(), 3);
    });

    it ('should correctly add stats to a minion', () => {
        const card = testCard();

        card.setStats(1, 1);
        card.addStats(1, 2);

        assert.equal(card.getAttack(), 2);
        assert.equal(card.getHealth(), 3);
    });

    it ('should correctly remove stats from a minion', () => {
        const card = testCard();

        card.setStats(3, 5);
        card.remStats(1, 2);

        assert.equal(card.getAttack(), 2);
        assert.equal(card.getHealth(), 3);
    });

    it ('should correctly restore health to a minion', () => {
        const card = testCard();

        card.setStats(5, 5); // The card has 5 health
        card.remHealth(3); // The card has 2 health

        card.addHealth(5); // Restore 5 health to the minion. 5+2 = 7, which is more than the max health, so set it to 5

        assert.equal(card.getHealth(), 5);
    });

    it ('should correctly add attack to a minion', () => {
        const card = testCard();

        card.setStats(1, 1);
        card.addAttack(5);

        assert.equal(card.getAttack(), 6);
    });

    it ('should correctly remove health from a minion', () => {
        const card = testCard();

        card.setStats(2, 6);
        card.remHealth(5);

        assert.equal(card.getHealth(), 1);
    });
    it ('should correctly fail to remove health from a location card', () => {
        const card = testCard();
        card.type = "Location"; // Trick the game into thinking this is a location card

        card.setStats(2, 6);
        card.remHealth(5); // This should fail since the card is a location card

        assert.equal(card.getHealth(), 6);
    });

    it ('should correctly remove attack from a minion', () => {
        const card = testCard();

        card.setStats(6, 1);
        card.remAttack(5);

        assert.equal(card.getAttack(), 1);
    });

    it ('should correctly reset a minion\'s max health', () => {
        const card = testCard();

        card.setStats(6, 6); // The health and max health is 6
        card.remHealth(4);   // The health is 2
        card.resetMaxHealth(); // The max health is now 2
        card.addHealth(4);   // Restore 4 health, but it will fail since it is above the minion's max health

        assert.equal(card.getHealth(), 2);
    });
    it ('should correctly reset a minion\'s max health', () => {
        const card = testCard();

        card.setStats(6, 6);         // The health and max health is 6
        card.setStats(6, 10, false); // The health is now 10
        card.resetMaxHealth(true);       // The max health is now 10
        card.setStats(6, 6, false);  // The health is now 6
        card.addHealth(100);         // Restore to max health, which is 10

        assert.equal(card.getHealth(), 10);
    });
    it ('should not reset a minion\'s max health', () => {
        const card = testCard();

        card.setStats(6, 10);        // The health and max health is 10
        card.setStats(6, 6, false);  // The health is now 6
        card.resetMaxHealth(true);   // The health is less than max health, and we pass true, so this does nothing.
        card.addHealth(100);         // Restore to max health, which is 10

        assert.equal(card.getHealth(), 10);
    });

    it ('should correct set stealth duration of a minion', () => {
        const card = testCard();
        card.setStealthDuration(5);

        assert.equal(card.stealthDuration, game.turns + 5);
    });

    it ('should correctly reset attack times', () => {
        const card = testCard();
        card.attackTimes = 0;

        card.resetAttackTimes();

        assert.equal(card.attackTimes, 1);
    });
    it ('should correctly reset attack times if it has windfury', () => {
        const card = testCard();
        card.addKeyword("Windfury");
        card.attackTimes = 0;

        card.resetAttackTimes();

        assert.equal(card.attackTimes, 2);
    });
    it ('should correctly reset attack times if it has mega-windfury', () => {
        const card = testCard();
        card.addKeyword("Mega-Windfury");
        card.attackTimes = 0;

        card.resetAttackTimes();

        assert.equal(card.attackTimes, 4);
    });

    it ('should correctly create a backup of the card', () => {
        const card = testCard();
        card.setStats(5, 5);

        const key = card.createBackup();

        card.setStats(1, 1);

        const stats = card.backups[key]["stats"]; // Find the stats backup

        assert.equal(stats[0], 5);
    });
    it ('should correctly apply a backup of the card', () => {
        const card = testCard();
        card.setStats(5, 5);

        const key = card.createBackup();
        card.setStats(1, 1);

        card.restoreBackup(card.backups[key]); // Restore the backup
        assert.equal(card.getAttack(), 5);
    });

    it ('should correctly kill a minion', () => {
        const card = testCard();

        card.setStats(5, 5);
        card.kill();

        assert.equal(card.getHealth(), 0);
    });

    it ('should correctly silence a minion', () => {
        const card = testCard();

        card.addKeyword("Taunt");
        card.setStats(5, 5);
        card.desc = "Hello!";

        card.silence();

        assert.equal(card.keywords.length, 0); // Keywords have been removed
        assert.equal(card.getAttack(), 1);     // Stats have been reset to 1/1
        assert.equal(card.desc, "");           // Desc has been removed
    });

    it ('should correctly destroy a minion', () => {
        // Destroy both silence, then kills the minion
        const card = testCard();

        card.addKeyword("Taunt");
        card.setStats(5, 5);
        card.desc = "Hello!";

        card.destroy();

        assert.equal(card.keywords.length, 0); // Keywords have been removed
        assert.equal(card.getAttack(), 1);     // Stats have been reset to 1/1
        assert.equal(card.desc, "");           // Desc has been removed

        assert.equal(card.getHealth(), 0)      // The minion has been killed
    });

    it ('should correctly activate a minion', () => {
        const card = testCard();

        card.addDeathrattle((plr, game, self) => {
            self.foo = "bar";
        });

        card.activate("deathrattle");

        assert.equal(card.foo, "bar");
    });

    it ('should correctly activate a minion\'s passive', () => {
        const card = testCard();

        game.summonMinion(card, test_player1); // So that the passive is actually triggered

        card.passive = [(plr, game, self, key, val) => {
            if (key != "baz") return;

            self.foo = val + "bar";
        }];

        game.events.broadcast("baz", "foo", test_player1);
        game.events.broadcast("bar", "baz", test_player1); // This should get ignored

        assert.equal(card.foo, "foobar");
    });

    it ('should correctly get manathirst', () => {
        const card = testCard();

        test_player1.maxMana = 4;
        const [ret, p] = card.manathirst(5, "fail", "pass");

        assert.equal(ret, false);
        assert.equal(p, "pass");
    });
    it ('should correctly get manathirst', () => {
        const card = testCard();

        test_player1.maxMana = 5;
        const [ret, p] = card.manathirst(5, "pass", "fail");

        assert.equal(ret, true);
        assert.equal(p, "pass");
    });

    it ('should correctly get enchantment info', () => {
        const card = testCard();

        const info = card.getEnchantmentInfo("mana = 1");
        const expected = {"key": "mana", "val": "1", "op": "="};

        assert.equal(info["key"], expected["key"]);
        assert.equal(info["mana"], expected["mana"]);
        assert.equal(info["op"], expected["op"]);
    });
    it ('should correctly get enchantment info', () => {
        const card = testCard();

        const info = card.getEnchantmentInfo("+1 mana");
        const expected = {"key": "mana", "val": "1", "op": "+"};

        assert.equal(info["key"], expected["key"]);
        assert.equal(info["mana"], expected["mana"]);
        assert.equal(info["op"], expected["op"]);
    });

    it ('should correctly add enchantents', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);

        assert.equal(card.enchantments[0].enchantment, "+1 mana");
    });

    it ('should correctly apply enchantents', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);
        card.applyEnchantments();

        assert.equal(card.mana, card.backups.init.mana + 1);
    });

    it ('should correctly check if an enchantent exists', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);
        const fail = card.enchantmentExists("mana = 1", card);
        const pass = card.enchantmentExists("+1 mana", card);

        assert.ok(pass);
        assert.ok(!fail);
    });

    it ('should correctly remove an enchantent', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);
        card.removeEnchantment("+1 mana", card);

        const fail = card.enchantmentExists("+1 mana", card);

        assert.ok(!fail);
    });

    it ('should correctly replace placeholders', () => {
        const card = testCard();
        card.desc = "This card costs: {cost}.";

        card.placeholders = [(plr, game, self) => {
            return {"cost": self.mana};
        }];

        card.replacePlaceholders();
        let fullCard = game.interact.doPlaceholders(card);

        assert.equal(card.desc, "This card costs: {ph:cost} placeholder {/ph}.");
        assert.equal(fullCard, card.desc.replace("{ph:cost} placeholder {/ph}", card.mana));
    });

    it ('should return a perfect copy', () => {
        const card = testCard();

        card.setStats(23, 65);

        const perfectCopy = card.perfectCopy();

        assert.equal(card.getAttack(), perfectCopy.getAttack());
        assert.notEqual(card.uuid, perfectCopy.uuid);
    });

    it ('should return an imperfect copy', () => {
        const card = testCard();

        card.setStats(23, 65);

        const imperfectCopy = card.imperfectCopy();

        assert.notEqual(card.getAttack(), imperfectCopy.getAttack());
        assert.notEqual(card.uuid, imperfectCopy.uuid);
    });
});
