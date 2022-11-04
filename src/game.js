const { question } = require('readline-sync');
const { Functions, Player, Constants } = require("./other");
const { Card } = require("./card");
const { Interact } = require("./interact");
const { exit } = require("process");
const { AI } = require('./ai');

class GameStats {
    constructor(game) {
        this.game = game;
        this.jadeCounter = 0;
    }

    cardUpdate(key, val) {
        // Infuse
        if (key == "minionsKilled") {
            val.plr.hand.forEach(p => {
                if (p.infuse_num < 0) return;

                p.desc = p.desc.replace(`Infuse (${p.infuse_num})`, `Infuse (${p.infuse_num - 1})`);
                p.infuse_num -= 1;

                if (p.infuse_num == 0) {
                    p.activate("infuse");
                    p.desc = p.desc.replace(`Infuse (${p.infuse_num})`, "Infused");
                }
            });
        }
        

        this.game.board.forEach(p => {
            p.forEach(m => {
                m.activate("unpassive", true);
                m.activate("passive", [key, val]);
            });
        });

        for (let i = 0; i < 2; i++) {
            let wpn = this.game["player" + (i + 1)].weapon;
            if (wpn) {
                wpn.activate("unpassive", true);
                wpn.activate("passive", [key, val]);
            }
        }

        this.game.activatePassives([key, val]);
    }

    questUpdate(quests_name, key, val, plr = this.game.player) {
        plr[quests_name].forEach(s => {
            if (s["key"] == key) {
                if (!s["manual_progression"]) s["progress"][0]++;

                const normal_done = (s["value"] + this[key][plr.id].length - 1) == this[key][plr.id].length;

                if (s["callback"](val, this.game, s["turn"], normal_done)) {
                    s["progress"][0]++;
                    plr[quests_name].splice(plr[quests_name].indexOf(s), 1);

                    if (quests_name == "secrets") this.game.input("\nYou triggered the opponents's '" + s.name + "'.\n");

                    if (s["next"]) new Card(s["next"], plr).activate("cast");
                }
            }
        });
    }

    update(key, val) {
        if (!this[key]) this[key] = [[], []];

        this[key][this.game.player.id].push(val);

        this.cardUpdate(key, val);

        this.questUpdate("secrets",    key, val, this.game.opponent);
        this.questUpdate("sidequests", key, val);
        this.questUpdate("quests",     key, val);
    }
}

class Game {
    constructor(player1, player2) {
        // Choose a random player to be player 1
        const functions = new Functions(this);

        if (functions.randInt(0, 10) < 5) {
            this.player1 = player1;
            this.player2 = player2;
        } else {
            this.player1 = player2;
            this.player2 = player1;
        }

        this.player = this.player1;
        this.opponent = this.player2;

        this.Card = Card;
        this.Player = Player;
        this.AI = AI;
        this.functions = functions;
        this.stats = new GameStats(this);
        this.interact = new Interact(this);
        this.constants = null;
        this.input = question;

        this.player1.id = 0;
        this.player2.id = 1;

        this.turns = 0;
        this.board = [[], []];

        this.passives = [];
        
        this.player1.game = this;
        this.player2.game = this;
    }

    set(key, val) {
        /**
         * Set this.key = val;
         * 
         * @returns {undefined}
         */

        this[key] = val;
    }
    setConstants(debug = false, maxDeckLength = 30, maxBoardSpace = 7, AIMulliganThreshold = 0) {
        /**
         * Sets the game constants
         * 
         * @param {boolean} debug [default=false] If debug mode should be enabled
         * @param {number} maxDeckLength [default=30] Maximum cards you can have in a custom deck
         * @param {number} maxBoardSpace [default=7] Maximum amount of minions you can have on the board at the same time
         * 
         * @returns {undefined}
         */

        this.constants = {"debug": debug, "maxDeckLength": maxDeckLength, "maxBoardSpace": maxBoardSpace, "AIMulliganThreshold": AIMulliganThreshold};
    }
    activatePassives(trigger) {
        /**
         * Loops through this.passives and executes the function
         * 
         * @param {any[]} trigger The thing that triggered the passives
         * 
         * @returns {any[]} Return values of all the executed functions
         */

        let ret = [];
        this.passives.forEach(i => ret.push(i(this, trigger)));
        return ret;
    }

    // Start / End
    startGame() {
        /**
         * Starts the game
         * 
         * @returns {undefined}
         */

        let players_hands = [[], []];

        // Add quest cards to the players hands
        for (let i = 0; i < 2; i++) {
            let deck = this["player" + (i + 1)].deck;

            deck.forEach(c => {
                if (c.desc.includes("Quest: ") || c.desc.includes("Questline: ")) {
                    players_hands[i].push(c);
                    deck.splice(deck.indexOf(c), 1);
                }
            })
        }

        this.player1.hand = players_hands[0];
        this.player2.hand = players_hands[1];

        this.player1.maxMana = 1;
        this.player1.mana = 1;

        while (this.player1.hand.length < 3) this.player1.drawCard(false);
        while (this.player2.hand.length < 4) this.player2.drawCard(false);

        this.player2.addToHand(new Card("The Coin", this.player2), false);

        this.turns += 1;

        if (this.player1.is_ai) this.player1.ai = new AI(this.player1);
        if (this.player2.is_ai) this.player2.ai = new AI(this.player2);

        for (let i = 0; i < 2; i++) {
            const plr = this["player" + (i + 1)]

            plr.deck.forEach(c => c.activate("startofgame"));
            plr.hand.forEach(c => c.activate("startofgame"));
        }
    }
    endGame(winner) {
        /**
         * Ends the game and declares "winner" as the winner
         * 
         * @param {Player} winner The winner
         * 
         * @returns {undefined}
         */

        // Todo: Maybe add more stuff here

        this.interact.printName();

        this.input(`Player ${winner.name} wins!\n`);

        exit(0);
    }
    endTurn() {
        /**
         * Ends the players turn and starts the opponents turn
         * 
         * @returns {undefined}
         */

        this.killMinions();

        // Update stats
        this.stats.update("turnEnds", this.turns);
        this.stats.cardsDrawnThisTurn = [[], []];

        let plr = this.player;
        let op = this.opponent;

        // Trigger endofturn
        this.board[plr.id].forEach(m => m.activate("endofturn"));
        if (plr.weapon) plr.weapon.activate("endofturn");

        // Trigger unspent mana
        if (plr.mana > 0) this.stats.update("unspentMana", plr.mana);

        // Remove echo cards
        plr.hand = plr.hand.filter(c => !c.echo);

        plr.attack = 0;

        // Turn starts
        this.turns++;

        this.stats.update("turnStarts", this.turns);
        
        // Mana stuff
        op.gainEmptyMana(1, true);
        op.mana = op.maxMana - op.overload;
        op.overload = 0;

        // Weapon stuff
        if (op.weapon) {
            if (op.weapon.getAttack() > 0) {
                op.attack += op.weapon.getAttack();
                op.weapon.resetAttackTimes();
            }

            op.weapon.activate("startofturn");
        }

        // Minion start of turn
        this.board[op.id].forEach(m => {
            // Dormant
            if (m.dormant) {
                if (this.turns > m.dormant) {
                    m.dormant = false;
                    m.turn = this.turns;
                    m.activateBattlecry();
                }

                return;
            }

            m.activate("startofturn");
            m.canAttackHero = true;
            m.sleepy = false;
            m.frozen = false;
            m.resetAttackTimes();

            // Stealth duration
            if (m.stealthDuration > 0 && this.turns > m.stealthDuration) {
                m.stealthDuration = 0;
                m.removeKeyword("Stealth");
            }

            // Location cooldown
            if (m.type == "Location" && m.cooldown > 0) m.cooldown--;
        });

        // Draw card
        op.drawCard();

        op.canUseHeroPower = true;

        this.player = op;
        this.opponent = plr;
    }

    // Playing cards
    playCard(card, player) {
        /**
         * Play a card
         * 
         * @param {Card} card The card to play
         * @param {Player} player The card's owner
         * 
         * @returns {string | Card} "mana" | "traded" | "space" | "magnetize" | (Card) The return value of summonMinion
         */

        this.killMinions();

        while (card.keywords.includes("Tradeable")) {
            let q = this.input(`Would you like to trade ${card.displayName} for a random card in your deck? (y: trade / n: play) `);

            if (!q.startsWith("y")) break;
            
            if (player.mana < 1) return "mana";

            player.mana -= 1;

            player.drawCard();
            player.shuffleIntoDeck(card);
            player.removeFromHand(card);
    
            return "traded";
        }

        if (player.mana < card.mana) return "mana";

        player.mana -= card.mana;
        //card.mana = card.backups.mana;
        
        player.removeFromHand(card);

        if (card.type == "Spell" && card.keywords.includes("Twinspell")) {
            card.removeKeyword("Twinspell");
            card.desc = card.desc.split("Twinspell")[0].trim();

            player.hand.push(card);
        }

        let echo_clone = null;

        if (card.keywords.includes("Echo")) {
            echo_clone = this.functions.cloneCard(card, player); // Create an exact copy of the card played
            echo_clone.echo = true;
        }

        let ret = true;

        let op = player.getOpponent();
        let board = this.board[player.id];

        if (op.counter && op.counter.includes(card.type)) {
            op.counter.splice(op.counter.indexOf(card.type), 1);    
            return "counter";
        }

        // If the board has more than the allowed amount of cards and the card played is a minion or location card, prevent it.
        if (board.length >= this.constants.maxBoardSpace && ["Minion", "Location"].includes(card.type)) {
            player.addToHand(card, false);
            player.mana += card.mana;
            return "space";
        }

        if (card.type === "Minion") {
            // Magnetize
            if (card.keywords.includes("Magnetic") && board.length > 0) {
                let mechs = board.filter(m => m.tribe == "Mech");
    
                // I'm using while loops to prevent a million indents
                while (mechs.length > 0) {
                    let q = this.input("Do you want to magnetize this minion to a mech? (y: yes / n: no) ");
                    if (!q.toLowerCase().startsWith("y")) break;
    
                    let minion = this.functions.selectTarget(`\nWhich minion do you want this to Magnetize to: `, false, "self", "minion");
                    if (minion.tribe != "Mech") return "invalid";
    
                    this.stats.update("minionsPlayed", card);
                    
                    minion.addStats(card.getAttack(), card.getHealth());
    
                    card.keywords.forEach(k => {
                        minion.addKeyword(k);
                    });
                        
                    minion.maxHealth += card.maxHealth;
    
                    if (card.deathrattle) card.deathrattle.forEach(d => minion.addDeathrattle(d));
    
                    if (echo_clone) player.hand.push(echo_clone);
    
                    return "magnetize";
                }
    
            }

            if (card.dormant) card.dormant += this.turns;
            else if (card.activateBattlecry() === -1) return "refund";

            if (echo_clone) player.hand.push(echo_clone);

            this.stats.update("minionsPlayed", card);

            ret = this.summonMinion(card, player, false);
        } else if (card.type === "Spell") {
            if (card.activate("cast") === -1) return "refund";

            if (card.keywords.includes("Twinspell")) {
                card.removeKeyword("Twinspell");
                card.desc = card.desc.split("Twinspell")[0].trim();

                player.hand.push(card);
            }

            if (echo_clone) player.hand.push(echo_clone);

            this.stats.update("spellsCast", card);

            board.forEach(m => {
                m.activate("spellburst");
                m.hasSpellburst = false;
            });
        } else if (card.type === "Weapon") {
            player.setWeapon(card);

            card.activateBattlecry();

            if (echo_clone) player.hand.push(echo_clone);
        } else if (card.type === "Hero") {
            player.setHero(card, 5);

            card.activateBattlecry();

            if (echo_clone) player.hand.push(echo_clone);
        } else if (card.type === "Location") {
            card.setStats(0, card.getHealth());
            card.immune = true;
            card.cooldown = 0;

            if (echo_clone) player.hand.push(echo_clone);

            this.stats.update("minionsPlayed", card);

            ret = this.summonMinion(card, player, false);
        }

        this.stats.update("cardsPlayed", card);
        let stat = this.stats.cardsPlayed[player.id];

        // If the previous card played was played on the same turn as this one, activate combo
        if (stat.length > 1 && stat[stat.length - 2].turn == this.turns) card.activate("combo");

        player.hand.forEach(c => {
            if (c.keywords.includes("Corrupt")) {
                if (card.mana > c.mana) {
                    let t = new Card(c.corrupt, c.plr);
                    c.plr.addToHand(t, false);
                    player.removeFromHand(c);
                }
            }
        });

        this.killMinions();

        return ret;
    }
    summonMinion(minion, player, update = true, trigger_colossal = true) {
        /**
         * Summon a minion
         * 
         * @param {Card} minion The minion to summon
         * @param {Player} player The player who gets the minion
         * @param {boolean} update [default=true] If the summon should trigger secrets / quests / passives.
         * @param {boolean} trigger_colossal [default=true] If the minion has colossal, summon the other minions.
         * 
         * @returns {Card} The minion summoned
         */

        if (update) this.stats.update("minionsSummoned", minion);

        player.spellDamage = 0;

        if (minion.keywords.includes("Charge")) minion.sleepy = false;

        if (minion.keywords.includes("Rush")) {
            minion.sleepy = false;
            minion.canAttackHero = false;
        }

        if (minion.colossal && trigger_colossal) {
            // minion.colossal is a string array.
            // example: ["Left Arm", "", "Right Arm"]
            // the "" gets replaced with the main minion

            minion.colossal.forEach(v => {
                if (v == "") return this.summonMinion(minion, player, false, false);

                let card = new Card(v, player);

                this.summonMinion(card, player, false, false);
            });

            return "colossal";
        }

        this.board[player.id].push(minion);

        this.board[player.id].forEach(m => {
            m.keywords.forEach(k => {
                if (k.startsWith("Spell Damage +")) player.spellDamage += parseInt(k.split("+")[1]);
            });
        });

        return minion;
    }

    // Interacting with minions
    killMinions() {
        /**
         * Kill all minions with 0 or less health
         * 
         * @returns {undefined}
         */

        for (let p = 0; p < 2; p++) {
            let n = [];
            
            this.board[p].forEach(m => {
                if (m.getHealth() <= 0) {
                    m.activate("deathrattle");
                }
            });

            this.board[p].forEach(m => {
                if (m.getHealth() <= 0) {
                    this.stats.update("minionsKilled", m);

                    if (m.keywords.includes("Reborn")) {
                        let minion = new Card(m.name, this["player" + (p + 1)]);

                        minion.removeKeyword("Reborn");
                        minion.setStats(minion.getAttack(), 1);

                        this.summonMinion(minion, this["player" + (p + 1)], false);

                        n.push(minion);
                    } else {
                        m.activate("unpassive", false);
                    }
                } else {
                    n.push(m);
                }
            });

            this.board[p] = n;
        }
    }
}

exports.Game = Game;
exports.GameStats = GameStats;