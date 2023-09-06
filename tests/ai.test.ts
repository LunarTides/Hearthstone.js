// Part of this code was copied from an example given by ChatGPT
import { Card, AI, createGame } from "../src/internal";

// Setup the game / copied from the card updater
const { game, player1: test_player1, player2: test_player2 } = createGame();

game.player1 = test_player1;
game.player2 = test_player2;

game.player1.id = 0;
game.player2.id = 1;

game.config.P1AI = false;
game.config.P2AI = false;

game.doConfigAI();

// Remove functions that clear the screen
game.interact.printName = () => {};
game.interact.printAll = () => {};
game.interact.printLicense = () => {};
game.interact.cls = () => {};

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
        expect(move).toBe("end");
    });

    it ('should find out if it can attack', () => {
        let canAttack = ai._canAttack();

        expect(canAttack).toBe(false);
    });

    it ('should find out if it can hero power', () => {
        let canHeroPower = ai._canHeroPower();

        expect(canHeroPower).toBe(false);
    });

    it ('should find out if it can use a location', () => {
        let canUseLocation = ai._canUseLocation();

        expect(canUseLocation).toBe(false);
    });

    it ('should find out if a specific card can attack', () => {
        let minion = new Card("Sheep", test_player1);
        minion.sleepy = true;
        minion.attackTimes = 0;
        
        let canAttack = ai._canMinionAttack(minion);

        expect(canAttack).toBe(false);
    });
    it ('should find out if a specific card can attack', () => {
        let minion = new Card("Sheep", test_player1);
        minion.ready();
        
        let canAttack = ai._canMinionAttack(minion);

        expect(canAttack).toBe(true);
    });

    it ('should find out if a specific card can be targetted', () => {
        let minion = new Card("Sheep", test_player1);
        
        let canTarget = ai._canTargetMinion(minion);

        expect(canTarget).toBe(true);
    });
    it ('should find out if a specific card can be targetted', () => {
        let minion = new Card("Sheep", test_player1);
        minion.immune = true;
        
        let canTarget = ai._canTargetMinion(minion);

        expect(canTarget).toBe(false);
    });

    it ('should find trades', () => {
        let trades = ai._attackFindTrades();

        expect(trades[0]).toHaveLength(0);
        expect(trades[1]).toHaveLength(0);
    });

    it ('should correctly score players', () => {
        let score = ai._scorePlayer(test_player1, game.board.map(m => {
            return m.map(c => {
                return {"card": c, "score": ai.analyzePositiveCard(c)};
            });
        }));

        expect(score).toBeGreaterThan(0);
    });

    it ('should find the current winner', () => {
        let score = ai._findWinner([[], []]);

        expect(score[0].id).toBe(ai.plr.getOpponent().id);
        expect(score[1]).toBeGreaterThan(0);
    });
    
    it ('should find out if a taunt exists', () => {
        let taunt = ai._tauntExists(false);

        expect(taunt).toBe(false);
    });
    it ('should find out if a taunt exists', () => {
        let taunts = ai._tauntExists(true);

        expect(Array.isArray(taunts)).toBe(true);
        expect(taunts).toHaveLength(0);
    });

    it ('should do a trade', () => {
        let result = ai._attackTrade();

        expect(result).toBeNull();
    });

    it ('should do a general attack', () => {
        let result = ai._attackGeneral([[], []]);

        expect(result[0]).toBe(-1);
    });

    it ('should do a risky attack', () => {
        let result = ai._attackGeneralRisky();

        expect(Array.isArray(result)).toBe(true);
        expect(result[1]).toBe(ai.plr.getOpponent());
    });

    it ('should choose attacker and target', () => {
        let result = ai._attackGeneralMinion();

        expect(Array.isArray(result)).toBe(true);
        
        expect(result[0]).toBe(-1);
        expect(result[1]).toBe(ai.plr.getOpponent());
    });

    it ('should choose target', () => {
        let result = ai._attackGeneralChooseTarget();

        expect(Array.isArray(result)).toBe(true);
        expect(result).toBe(ai.plr.getOpponent());
    });

    it ('should choose attacker', () => {
        let result = ai._attackGeneralChooseAttacker(true);

        expect(result).toBe(-1);
    });

    it ('should attack', () => {
        let result = ai.attack();

        expect(result[0]).toBe(-1);
        expect(result[1]).toBe(-1);
    });

    it ('should attack using legacy 1', () => {
        let result = ai.legacy_attack_1();

        expect(result[0]).toBe(-1);
        expect(result[1]).toBe(-1);
    });

    it ('should select a target', () => {
        let result = ai.selectTarget("Deal 1 damage.", null, "any", "any", []);

        // There are no minions and the prompt is bad, so the ai should select the enemy hero
        expect(result).toBe(ai.plr.getOpponent());
    });

    it ('should discover', () => {
        let cards = [
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1)
        ];
        
        let result = ai.discover(cards);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(cards[0].id);
    });

    it ('should dredge', () => {
        let cards = [
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1),
            new Card("Sheep", test_player1)
        ];
        
        let result = ai.dredge(cards);

        expect(result).not.toBeNull();
        expect(result!.id).toBe(cards[0].id);
    });

    it ('should choose one', () => {
        let options = [
            "Heal 9999 health.",
            "Destroy a friendly minion.",
            "Destroy the enemy hero."
        ];
        
        let result = ai.chooseOne(options);

        // "Destroy the enemy hero" is the best
        expect(result).toBe(2);
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
        expect(result).toBe(2);
    });

    it ('should answer a yes/no question', () => {
        let question = "Do you want to destroy the enemy hero?";
        
        let result = ai.yesNoQuestion(question);

        expect(result).toBe(true);
    });
    it ('should answer a yes/no question', () => {
        let question = "Do you want to destroy your hero?";
        
        let result = ai.yesNoQuestion(question);

        expect(result).toBe(false);
    });

    it ('should trade cards', () => {
        let card = new Card("Sheep", test_player1);
        
        let result = ai.trade(card);

        // No cards to trade into
        expect(result).toBe(false);
    });
    it ('should trade cards', () => {
        let card = new Card("Sheep", test_player1);
        test_player1.shuffleIntoDeck(card.imperfectCopy());
        test_player1.shuffleIntoDeck(card.imperfectCopy());
        test_player1.mana = 1;
        
        let result = ai.trade(card);

        expect(result).toBe(true);
    });

    it ('should mulligan', () => {
        let card = new Card("Sheep", test_player1);

        for (let i = 0; i < 3; i++) test_player1.addToHand(card.imperfectCopy());        
        let result = ai.mulligan();

        // Mulligan all their cards
        expect(result).toBe("123");
    });

    it ('should evaluate text', () => {
        let text = "Destroy the enemy hero";

        let result = ai.analyzePositive(text);

        // REALLY good
        expect(result).toBe(9);
    });
    it ('should evaluate text', () => {
        let text = "Destroy your hero";

        let result = ai.analyzePositive(text);

        // REALLY bad
        // Destroy = -9, Your = +1
        expect(result).toBe(-9 + 1);
    });

    it ('should evaluate cards', () => {
        let card = new Card("Sheep", test_player1);

        let result = ai.analyzePositiveCard(card);

        // Not very good
        expect(result).toBe(-0.35);
    });
    it ('should evaluate cards', () => {
        let card = new Card("Sheep", test_player1);
        card.setStats(9, 9)

        let result = ai.analyzePositiveCard(card);

        // Pretty good
        expect(result).toBe(2.85);
    });
});
