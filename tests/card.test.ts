import "colors";
import { Player, Game, Card } from "../src/internal.js";
import { expect } from "chai";

// Setup the game / copied from the card updater
const game = new Game();
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");
game.setup(test_player1, test_player2);

const functions = game.functions;

functions.importCards(functions.dirname() + "cards");
functions.importConfig(functions.dirname() + "config");

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
describe("Card", () => {
    it ('should correctly create a card', () => {
        const card = testCard();

        expect(card.name).to.equal("Sheep");
    });

    it ('should correctly randomize uuid', () => {
        const card = testCard();
        const uuid = card.uuid;

        card.randomizeUUID();

        expect(card.uuid).to.not.equal(uuid);
    });

    it ('should correctly add a deathrattle', () => {
        const card = testCard();

        card.addDeathrattle((plr, game, self) => {
            self.displayName = "foo";
        });

        card.activate("deathrattle");

        expect(card.displayName).to.equal("foo");
    });

    it ('should correctly add a keyword', () => {
        const card = testCard();

        card.addKeyword("Taunt");

        expect(card.keywords[0]).to.equal("Taunt");
    });

    it ('should correctly remove a keyword', () => {
        const card = testCard();

        card.addKeyword("Taunt");
        card.removeKeyword("Taunt");

        expect(card.keywords.length).to.equal(0);
    });

    it ('should correctly freeze a minion', () => {
        const card = testCard();

        card.freeze();

        expect(card.frozen).to.equal(true);
    });

    it ('should correctly decrease a minion\'s attack', () => {
        const card = testCard();

        card.ready();
        card.decAttack();

        expect(card.attackTimes).to.equal(0);
        expect(card.sleepy).to.be.false;
    });

    it ('should ready a minion', () => {
        const card = testCard();

        card.ready();

        expect(card.attackTimes).to.equal(1);
        expect(card.sleepy).to.be.false;
    });

    it ('should correctly get/set the attack of a minion', () => {
        const card = testCard();

        card.setStats(2, 3);

        expect(card.getAttack()).to.equal(2);
    });

    it ('should correctly get/set the health of a minion', () => {
        const card = testCard();

        card.setStats(2, 3);

        expect(card.getHealth()).to.equal(3);
    });

    it ('should correctly add stats to a minion', () => {
        const card = testCard();

        card.setStats(1, 1);
        card.addStats(1, 2);

        expect(card.getAttack()).to.equal(2);
        expect(card.getHealth()).to.equal(3);
    });

    it ('should correctly remove stats from a minion', () => {
        const card = testCard();

        card.setStats(3, 5);
        card.remStats(1, 2);

        expect(card.getAttack()).to.equal(2);
        expect(card.getHealth()).to.equal(3);
    });

    it ('should correctly restore health to a minion', () => {
        const card = testCard();

        card.setStats(5, 5); // The card has 5 health
        card.remHealth(3); // The card has 2 health

        card.addHealth(5); // Restore 5 health to the minion. 5+2 = 7, which is more than the max health, so set it to 5

        expect(card.getHealth()).to.equal(5);
    });

    it ('should correctly add attack to a minion', () => {
        const card = testCard();

        card.setStats(1, 1);
        card.addAttack(5);

        expect(card.getAttack()).to.equal(6);
    });

    it ('should correctly remove health from a minion', () => {
        const card = testCard();

        card.setStats(2, 6);
        card.remHealth(5);

        expect(card.getHealth()).to.equal(1);
    });
    it ('should correctly fail to remove health from a location card', () => {
        const card = testCard();
        card.type = "Location"; // Trick the game into thinking this is a location card

        card.setStats(2, 6);
        card.remHealth(5); // This should fail since the card is a location card

        expect(card.getHealth()).to.equal(6);
    });

    it ('should correctly remove attack from a minion', () => {
        const card = testCard();

        card.setStats(6, 1);
        card.remAttack(5);

        expect(card.getAttack()).to.equal(1);
    });

    it ('should correctly reset a minion\'s max health', () => {
        const card = testCard();

        card.setStats(6, 6, true); // The health and max health is 6
        card.remHealth(4);         // The health is 2
        card.resetMaxHealth();     // The max health is now 2
        card.addHealth(4);         // Restore 4 health, but it will fail since it is above the minion's max health

        expect(card.getHealth()).to.equal(2);
    });
    it ('should correctly reset a minion\'s max health', () => {
        const card = testCard();

        card.setStats(6, 6);         // The health and max health is 6
        card.setStats(6, 10, false); // The health is now 10
        card.resetMaxHealth(true);   // The max health is now 10
        card.setStats(6, 6, false);  // The health is now 6
        card.addHealth(100);         // Restore to max health, which is 10

        expect(card.getHealth()).to.equal(10);
    });
    it ('should not reset a minion\'s max health', () => {
        const card = testCard();

        card.setStats(6, 10);        // The health and max health is 10
        card.setStats(6, 6, false);  // The health is now 6
        card.resetMaxHealth(true);   // The health is less than max health, and we pass true, so this does nothing.
        card.addHealth(100);         // Restore to max health, which is 10

        expect(card.getHealth()).to.equal(10);
    });

    it ('should correct set stealth duration of a minion', () => {
        const card = testCard();
        card.setStealthDuration(5);

        expect(card.stealthDuration).to.equal(game.turns + 5);
    });

    it ('should correctly reset attack times', () => {
        const card = testCard();
        card.attackTimes = 0;

        card.resetAttackTimes();

        expect(card.attackTimes).to.equal(1);
    });
    it ('should correctly reset attack times if it has windfury', () => {
        const card = testCard();
        card.addKeyword("Windfury");
        card.attackTimes = 0;

        card.resetAttackTimes();

        expect(card.attackTimes).to.equal(2);
    });
    it ('should correctly reset attack times if it has mega-windfury', () => {
        const card = testCard();
        card.addKeyword("Mega-Windfury");
        card.attackTimes = 0;

        card.resetAttackTimes();

        expect(card.attackTimes).to.equal(4);
    });

    it ('should correctly create a backup of the card', () => {
        const card = testCard();
        card.setStats(5, 5);

        const key = card.createBackup();

        card.setStats(1, 1);

        const stats = card.backups[key].stats; // Find the stats backup

        expect(stats).to.not.be.undefined;
        expect(stats![0]).to.equal(5);
    });
    it ('should correctly apply a backup of the card', () => {
        const card = testCard();
        card.setStats(5, 5);

        const key = card.createBackup();
        card.setStats(1, 1);

        card.restoreBackup(card.backups[key]); // Restore the backup
        expect(card.getAttack()).to.equal(5);
    });

    it ('should correctly kill a minion', () => {
        const card = testCard();

        card.setStats(5, 5);
        card.kill();

        expect(card.getHealth()).to.equal(0);
    });

    it ('should correctly silence a minion', () => {
        const card = testCard();

        card.addKeyword("Taunt");
        card.setStats(5, 5);
        card.desc = "Hello!";

        card.silence();

        expect(card.keywords).to.have.length(0); // Keywords have been removed
        expect(card.getAttack()).to.equal(1);    // Stats have been reset to 1/1
        expect(card.getHealth()).to.equal(1);    // Stats have been reset to 1/1
        expect(card.desc).to.be.empty;           // Desc has been removed
    });

    it ('should correctly destroy a minion', () => {
        // Destroy both silence, then kills the minion
        const card = testCard();

        card.addKeyword("Taunt");
        card.setStats(5, 5);
        card.desc = "Hello!";

        card.destroy();

        expect(card.keywords).to.have.length(0); // Keywords have been removed
        expect(card.getAttack()).to.equal(1);    // Stats have been reset to 1/1
        expect(card.desc).to.be.empty;           // Desc has been removed

        expect(card.getHealth()).to.equal(0);    // The minion has been killed
    });

    it ('should correctly activate a minion', () => {
        const card = testCard();

        card.addDeathrattle((plr, game, self) => {
            self.displayName = "bar";
        });

        card.activate("deathrattle");

        expect(card.displayName).to.equal("bar");
    });

    it ('should correctly activate a minion\'s passive', () => {
        const card = testCard();

        game.summonMinion(card, test_player1); // So that the passive is actually triggered
        card.displayName = "";

        card.abilities.passive = [(plr, game, self, key, val) => {
            if (key != "Dummy") return;

            self.displayName += val + "bar";
        }];

        game.events.broadcast("Dummy", "foo", test_player1);
        game.events.broadcast("Dummy", "baz", test_player1); // This should get ignored

        expect(card.displayName).to.equal("foobarbazbar");
    });

    it ('should correctly get manathirst', () => {
        const card = testCard();

        test_player1.maxMana = 4;
        const ret = card.manathirst(5);
        const p = ret ? "pass" : "fail";

        expect(ret).to.be.false;
        expect(p).to.be.equal("fail");
    });
    it ('should correctly get manathirst', () => {
        const card = testCard();

        test_player1.maxMana = 5;
        const ret = card.manathirst(5);
        const p = ret ? "pass" : "fail";

        expect(ret).to.be.true;
        expect(p).to.be.equal("pass");
    });

    it ('should correctly get enchantment info', () => {
        const card = testCard();

        const info = card.getEnchantmentInfo("mana = 1");
        const expected = {"key": "mana", "val": "1", "op": "="};

        expect(info.key).to.equal(expected.key);
        expect(info.val).to.equal(expected.val);
        expect(info.op).to.equal(expected.op);
    });
    it ('should correctly get enchantment info', () => {
        const card = testCard();

        const info = card.getEnchantmentInfo("+1 mana");
        const expected = {"key": "mana", "val": "1", "op": "+"};

        expect(info.key).to.equal(expected.key);
        expect(info.val).to.equal(expected.val);
        expect(info.op).to.equal(expected.op);
    });

    it ('should correctly add enchantents', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);

        expect(card.enchantments).to.have.length(1);
        expect(card.enchantments[0].enchantment).to.equal("+1 mana");
    });

    it ('should correctly apply enchantents', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);
        card.applyEnchantments();

        expect(card.mana).to.equal(card.backups.init.mana + 1);
    });

    it ('should correctly check if an enchantent exists', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);
        const fail = card.enchantmentExists("mana = 1", card);
        const pass = card.enchantmentExists("+1 mana", card);

        expect(pass).to.be.true;
        expect(fail).to.be.false;
    });

    it ('should correctly remove an enchantent', () => {
        const card = testCard();

        card.addEnchantment("+1 mana", card);
        card.removeEnchantment("+1 mana", card);

        const fail = card.enchantmentExists("+1 mana", card);

        expect(fail).to.be.false;
    });

    it ('should correctly replace placeholders', () => {
        const card = testCard();
        card.desc = "This card costs: {cost}.";

        card.abilities.placeholders = [(plr, game, self) => {
            return {"cost": self.mana};
        }];

        card.replacePlaceholders();
        let fullCard = game.interact.doPlaceholders(card);

        expect(card.desc).to.be.equal("This card costs: {ph:cost} placeholder {/ph}.");
        expect(fullCard).to.be.equal(`This card costs: ${card.mana}.`);
    });

    it ('should return a perfect copy', () => {
        const card = testCard();

        card.setStats(23, 65);

        const perfectCopy = card.perfectCopy();

        expect(card.getAttack()).to.equal(perfectCopy.getAttack());
        expect(card.uuid).to.not.equal(perfectCopy.uuid);
    });

    it ('should return an imperfect copy', () => {
        const card = testCard();

        card.setStats(23, 65);

        const imperfectCopy = card.imperfectCopy();

        expect(card.getAttack()).to.not.equal(imperfectCopy.getAttack());
        expect(card.uuid).to.not.equal(imperfectCopy.uuid);
    });
});
