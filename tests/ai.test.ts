// Part of this code was copied from an example given by ChatGPT
import { Player, Game, Card, AI } from "../src/internal";
import { expect } from "chai";

// Setup the game / copied from the card updater
const game = new Game();
const test_player1 = new Player("Test Player 1"); // Use this if a temp player crashes the game
const test_player2 = new Player("Test Player 2");
game.setup(test_player1, test_player2);

game.player1 = test_player1;
game.player2 = test_player2;

game.player1.id = 0;
game.player2.id = 1;

const functions = game.functions;
const interact = game.interact;

functions.importCards(game.functions.dirname() + "cards");
functions.importConfig(game.functions.dirname() + "config");

game.config.P1AI = false;
game.config.P2AI = false;

game.doConfigAI();

// Remove functions that clear the screen
interact.printName = () => {};
interact.printAll = () => {};
interact.printLicense = () => {};
interact.cls = () => {};

const ai = new AI(test_player1);

// Begin testing
describe("AI", () => {
    beforeEach(() => {
        game.board = [[], []];
        game.player = test_player1;
        game.opponent = test_player2; 

        test_player1.hand = [];
        test_player1.deck = [];
    });

    it ('should calculate move', () => {
        let move = ai.calcMove();

        // The ai can't do anything
        expect(move).to.be("end");
    });

    it ('should find out if it can attack', () => {
        let canAttack = ai._canAttack();

        expect(canAttack).to.be.false;
    });

    it ('should find out if it can hero power', () => {
        let canHeroPower = ai._canHeroPower();

        expect(canHeroPower).to.be.false;
    });

    it ('should find out if it can use a location', () => {
        let canUseLocation = ai._canUseLocation();

        expect(canUseLocation).to.be.false;
    });

    it ('should find out if a specific card can attack', () => {
        let minion = new Card("Sheep", test_player1);
        minion.sleepy = true;
        minion.attackTimes = 0;
        
        let canAttack = ai._canMinionAttack(minion);

        expect(canAttack).to.be.false;
    });
    it ('should find out if a specific card can attack', () => {
        let minion = new Card("Sheep", test_player1);
        minion.ready();
        
        let canAttack = ai._canMinionAttack(minion);

        expect(canAttack).to.be.true;
    });

    it ('should find out if a specific card can be targetted', () => {
        let minion = new Card("Sheep", test_player1);
        
        let canTarget = ai._canTargetMinion(minion);

        expect(canTarget).to.be.true;
    });
    it ('should find out if a specific card can be targetted', () => {
        let minion = new Card("Sheep", test_player1);
        minion.immune = true;
        
        let canTarget = ai._canTargetMinion(minion);

        expect(canTarget).to.be.false;
    });

    it ('should find trades', () => {
        let trades = ai._attackFindTrades();

        expect(trades[0]).to.have.length(0);
        expect(trades[1]).to.have.length(0);
    });

    it ('should correctly score players', () => {
        let score = ai._scorePlayer(test_player1, game.board.map(m => {
            return m.map(c => {
                return {"card": c, "score": ai.analyzePositiveCard(c)};
            });
        }));

        expect(score).to.be.above(0);
    });

    it ('should find the current winner', () => {
        let score = ai._findWinner([[], []]);

        expect(score[0].id).to.equal(ai.plr.getOpponent().id);
        expect(score[1]).to.be.above(0);
    });
    
    it ('should find out if a taunt exists', () => {
        let taunt = ai._tauntExists(false);

        expect(taunt).to.be.false;
    });
    it ('should find out if a taunt exists', () => {
        let taunts = ai._tauntExists(true);

        expect(taunts).to.be.an("array");
        expect(taunts).to.have.length(0);
    });

    it ('should do a trade', () => {
        let result = ai._attackTrade();

        expect(result).to.be.null;
    });

    it ('should do a general attack', () => {
        let result = ai._attackGeneral([[], []]);

        expect(result[0]).to.equal(-1);
    });

    it ('should do a risky attack', () => {
        let result = ai._attackGeneralRisky();

        expect(result).to.be.an("array");
        expect(result[1]).to.equal(ai.plr.getOpponent());
    });

    it ('should choose attacker and target', () => {
        let result = ai._attackGeneralMinion();

        expect(result).to.be.an("array");
        
        expect(result[0]).to.equal(-1);
        expect(result[1]).to.equal(ai.plr.getOpponent());
    });

    it ('should choose target', () => {
        let result = ai._attackGeneralChooseTarget();

        expect(result).to.be.an("array");
        expect(result).to.equal(ai.plr.getOpponent());
    });

    it ('should choose attacker', () => {
        let result = ai._attackGeneralChooseAttacker(true);

        expect(result).to.equal(-1);
    });

    it ('should attack', () => {
        let result = ai.attack();

        expect(result[0]).to.equal(-1);
        expect(result[1]).to.equal(-1);
    });

    it ('should attack using legacy 1', () => {
        let result = ai.legacy_attack_1();

        expect(result[0]).to.equal(-1);
        expect(result[1]).to.equal(-1);
    });

    it ('should select a target', () => {
        let result = ai.selectTarget("Deal 1 damage.", null, "any", "any", []);

        // There are no minions and the prompt is bad, so the ai should select the enemy hero
        expect(result).to.equal(ai.plr.getOpponent());
    });

    it ('should discover', () => {
        let cards = [
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1)
        ];
        
        let result = ai.discover(cards);

        expect(result).to.not.be.null;
        expect(result!.id).to.equal(cards[0].id);
    });

    it ('should dredge', () => {
        let cards = [
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1)
        ];
        
        let result = ai.dredge(cards);

        expect(result).to.not.be.null;
        expect(result!.id).to.equal(cards[0].id);
    });

    it ('should choose one', () => {
        let options = [
            "Heal 9999 health.",
            "Destroy a friendly minion.",
            "Destroy the enemy hero."
        ];
        
        let result = ai.chooseOne(options);

        // "Destroy the enemy hero" is the best
        expect(result).to.equal(2);
    });

    it ('should answer a question', () => {
        let prompt = "What do you want to do?";
        let options = [
            "Heal 9999 health.",
            "Destroy a friendly minion.",
            "Destroy the enemy hero."
        ];
        
        let result = ai.question(prompt, options);

        // "Destroy the enemy hero" is the best
        expect(result).to.equal(2);
    });

    it ('should answer a yes/no question', () => {
        let question = "Do you want to destroy the enemy hero?";
        
        let result = ai.yesNoQuestion(question);

        expect(result).to.be.true;
    });
    it ('should answer a yes/no question', () => {
        let question = "Do you want to destroy your hero?";
        
        let result = ai.yesNoQuestion(question);

        expect(result).to.be.false;
    });

    it ('should trade cards', () => {
        let card = new Card("Sheep", test_player1);
        
        let result = ai.trade(card);

        // No cards to trade into
        expect(result).to.be.false;
    });
    it ('should trade cards', () => {
        let card = new Card("Sheep", test_player1);
        test_player1.shuffleIntoDeck(card.imperfectCopy());
        test_player1.shuffleIntoDeck(card.imperfectCopy());
        test_player1.mana = 1;
        
        let result = ai.trade(card);

        expect(result).to.be.true;
    });

    it ('should mulligan', () => {
        let card = new Card("Sheep", test_player1);

        for (let i = 0; i < 3; i++) test_player1.addToHand(card.imperfectCopy());        
        let result = ai.mulligan();

        // Mulligan all their cards
        expect(result).to.equal("123");
    });

    it ('should evaluate text', () => {
        let text = "Destroy the enemy hero";

        let result = ai.analyzePositive(text);

        // REALLY good
        expect(result).to.equal(9);
    });
    it ('should evaluate text', () => {
        let text = "Destroy your hero";

        let result = ai.analyzePositive(text);

        // REALLY bad
        // Destroy = -9, Your = +1
        expect(result).to.equal(-9 + 1);
    });

    it ('should evaluate cards', () => {
        let card = new Card("Sheep", test_player1);

        let result = ai.analyzePositiveCard(card);

        // Not very good
        expect(result).to.equal(-0.35);
    });
    it ('should evaluate cards', () => {
        let card = new Card("Sheep", test_player1);
        card.setStats(9, 9)

        let result = ai.analyzePositiveCard(card);

        // Pretty good
        expect(result).to.equal(2.85);
    });
});
