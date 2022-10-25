const { question } = require('readline-sync');
const { Functions, Player } = require("./other");
const { Card } = require("./card");
const { Interact } = require("./interact");
const { exit } = require("process")

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
        this.questUpdate("questlines", key, val);
    }
}

class Game {
    constructor(player1, player2) {
        // Choose a random player to be player 1
        const functions = new Functions();

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
        this.functions = functions;
        this.stats = new GameStats(this);
        this.interact = new Interact(this);
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
        this[key] = val;
    }

    activatePassives(trigger) {
        let ret = [];
        this.passives.forEach(i => ret.push(i(this, trigger)));
        return ret;
    }

    startGame() {
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

        this.functions.addToHand(new Card("The Coin", this.player2), this.player2, false)

        this.turns += 1;

        for (let i = 0; i < 2; i++) {
            const plr = this["player" + (i + 1)]

            plr.deck.forEach(c => c.activate("startofgame"));
            plr.hand.forEach(c => c.activate("startofgame"));
        }
    }

    endGame(winner) {
        // Todo: Maybe add more stuff here

        this.interact.printName();

        console.log(`Player ${winner.name} wins!`);

        exit(0);
    }

    endTurn() {
        this.killMinions();

        this.stats.update("turnEnds", this.turns);
        this.stats.cardsDrawnThisTurn = [[], []]

        let plr = this.player;

        if (plr.mana > 0) {
            this.stats.update("unspentMana", plr.mana);
        }

        this.board[plr.id].forEach(m => m.activate("endofturn"));

        // Remove echo cards
        plr.hand = plr.hand.filter(c => !c.echo);

        plr.attack = 0;


        this.opponent.maxMana += 1;
        this.opponent.mana = this.opponent.maxMana;

        this.player = this.opponent;
        this.opponent = plr;

        this.turns += 1;

        this.startTurn();
    }

    startTurn() {
        this.killMinions();

        this.stats.update("turnStarts", this.turns);

        this.interact.printName()

        if (this.player.weapon && this.player.weapon.getAttack()) {
            this.player.attack += this.player.weapon.getAttack();
            this.player.weapon.resetAttackTimes();
        }

        this.player.mana -= this.player.overload;
        this.player.overload = 0;

        if (this.player.weapon) this.player.weapon.activate("startofturn");

        this.board[this.player.id].forEach(m => {
            m.activate("startofturn");
            m.canAttackHero = true;
            m.resetAttackTimes();

            if (m.stealthDuration > 0 && this.turns > m.stealthDuration) {
                m.stealthDuration = 0;
                m.removeKeyword("Stealth");
            }

            if (m.dormant) {
                if (this.turns > m.dormant) {
                    m.dormant = false;
                    m.activateBattlecry();
                }

                m.turn = this.turns;
            } else {
                m.frozen = false;
            }
        });

        this.player.drawCard();

        this.player.canUseHeroPower = true;
        this.player.hasPlayedCardThisTurn = false;
    }

    playCard(card, player) {
        this.killMinions();

        if (player.mana < card.mana) {
            this.input("Not enough mana.\n");
            return "mana";
        }

        if (card.keywords.includes("Tradeable")) {
            var q = this.input(`Would you like to trade ${card.displayName} for a random card in your deck? (y: trade / n: play) `);

            if (q.startsWith("y")) {
                if (player.mana < 1) {
                    this.input("Not enough mana.\n");
                    return "mana";
                }

                player.mana -= - 1;

                player.shuffleIntoDeck(card);

                var n = []

                var found = false;

                player.hand.forEach(function(c) {
                    if (c.displayName === card.displayName && !found) {
                        found = true;
                    } else {
                        n.push(c);
                    }
                });

                if (card.type == "Spell" && card.keywords.includes("Twinspell")) {
                    card.removeKeyword("Twinspell");
                    card.desc = card.desc.split("Twinspell")[0].trim();
        
                    n.push(card);
                }
        
                if (card.keywords.includes("Echo")) {
                    let clone = Object.assign(Object.create(Object.getPrototypeOf(card)), card)
                    clone.echo = true;
        
                    n.push(clone);
                }
        
                player.hand = n;

                player.drawCard();
                return "traded";
            }
        }

        player.mana -= card.mana;
        card.mana = card._mana;
        
        var n = []

        var found = false;

        player.hand.forEach(function(c) {
            if (c.displayName === card.displayName && !found) {
                found = true;
            } else {
                n.push(c);
            }
        });

        if (card.type == "Spell" && card.keywords.includes("Twinspell")) {
            card.removeKeyword("Twinspell");
            card.desc = card.desc.split("Twinspell")[0].trim();

            n.push(card);
        }

        if (card.keywords.includes("Echo")) {
            let clone = Object.assign(Object.create(Object.getPrototypeOf(card)), card)
            clone.echo = true;

            n.push(clone);
        }

        player.hand = n;

        if (card.type == "Minion" && this.board[player.id].length > 0 && card.keywords.includes("Magnetic")) {
            let hasMech = false;

            this.board[player.id].forEach(m => {
                if (m.tribe == "Mech") {
                    hasMech = true;
                }
            });

            while (hasMech) {
                let m = this.input("Do you want to magnetize this minion to a mech? (y: yes / n: no) ");
                if (!m.toLowerCase().startsWith("y")) break;

                let loc = this.functions.selectTarget(`\nWhich minion do you want this to Magnetize to: `, false, "self", "minion");

                this.stats.update("minionsPlayed", card);

                if (loc.tribe == "Mech") {
                    loc.addStats(card.getAttack(), card.getHealth());

                    card.keywords.forEach(k => {
                        loc.addKeyword(k);
                    });

                    loc.maxHealth += card.maxHealth;

                    card.deathrattle.forEach(d => {
                        loc.addDeathrattle(d);
                    });

                    return "magnetize";
                }
            }

        }

        if (card.type === "Minion") {
            if (player.counter && player.counter.includes("Minion")) {
                player.counter.splice(player.counter.indexOf("Minion"), 1);
    
                this.input("Your minion has been countered.\n")
    
                return "counter";
            }
    
            if (this.board[player.id].length >= 7) {
                this.input("\nYou can only have 7 minions on the board.\n");
                this.functions.addToHand(card, player, false);
                player.mana += card.mana;
                return "space";
            }

            if (card.dormant) card.dormant = card.dormant + this.turns;
            else if (card.activateBattlecry() === -1) return "refund";

            this.stats.update("minionsPlayed", card);

            this.playMinion(card, player, false);
        } else if (card.type === "Spell") {
            if (player.counter && player.counter.includes("Spell")) {
                player.counter.splice(player.counter.indexOf("Spell"), 1);

                this.input("Your spell has been countered.\n")

                return "counter";
            }

            if (card.activate("cast") === -1) return "refund";

            this.stats.update("spellsCast", card);

            this.board[player.id].forEach(m => {
                m.activate("spellburst");
                m.hasSpellburst = false;
            });
        } else if (card.type === "Weapon") {
            player.setWeapon(card);

            card.activateBattlecry();
        } else if (card.type === "Hero") {
            player.setHero(card, 5);

            card.activateBattlecry();
        }

        if (player.hasPlayedCardThisTurn) {
            card.activate("combo");
        }

        player.hasPlayedCardThisTurn = true;

        this.stats.update("cardsPlayed", card);

        var corrupted = null;

        card.plr.hand.forEach(c => {
            if (c.keywords.includes("Corrupt")) {
                if (card.mana > c.mana) {
                    corrupted = c;

                    c.removeKeyword("Corrupt");
                    c.addKeyword("Corrupted");

                    let t = new Card(c.corrupt, c.plr);

                    this.functions.addToHand(t, c.plr, false);

                    return "corrupt";
                }
            }
        });

        if (corrupted) {
            var n = []

            var found = false;

            this.player.hand.forEach(function(c) {
                if (c.displayName === corrupted.displayName && !found) {
                    found = true;
                } else {
                    n.push(c);
                }
            });

            player.hand = n;
        }

        this.killMinions();
    }

    playMinion(minion, player, summoned = true, trigger_colossal = true) {
        player.spellDamage = 0;

        var p = player.id;

        minion.turn = this.turns;

        if (minion.keywords.includes("Charge")) {
            minion.turn = this.turns - 1;
        }

        if (minion.keywords.includes("Rush")) {
            minion.turn = this.turns - 1;
            minion.canAttackHero = false;
        }

        if (minion.colossal && trigger_colossal) {
            minion.colossal.forEach((v, i) => {
                let card = new Card(v, player);

                this.playMinion(card, player, false, false);
            });

            return "colossal";
        }

        this.board[p].push(minion);

        if (summoned) {
            this.stats.update("minionsSummoned", minion);
        }

        this.board[p].forEach(m => {
            m.keywords.forEach(k => {
                if (k.startsWith("Spell Damage +")) {
                    player.spellDamage += parseInt(k.split("+")[1]);
                }
            });
        });
    }

    killMinions() {
        for (var p = 0; p < 2; p++) {
            var n = [];
            
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

                        this.playMinion(minion, this["player" + (p + 1)], false);

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

    attackMinion(minion, target) {
        this.killMinions();

        if (minion instanceof Player && minion.frozen) return false

        if (minion instanceof Card && (minion.frozen || minion.dormant)) return false;

        // Check if there is a minion with taunt
        var prevent = false;

        this.board[this.opponent.id].forEach(m => {
            if (m.keywords.includes("Taunt") && m != target) {
                prevent = true;
                return;
            }
        });

        if (prevent || target.immune || target.dormant) return false;

        if (!isNaN(minion)) {
            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");

                return false;
            }

            target.remStats(0, minion)

            if (target.getHealth() > 0) {
                target.activate("frenzy");
            }

            this.killMinions();

            return;
        } else if (minion.attackTimes > 0) {
            if (minion.getAttack() <= 0) return false;

            minion.attackTimes--;

            this.stats.update("enemyAttacks", [minion, target]);
            this.stats.update("minionsThatAttacked", [minion, target]);
            this.stats.update("minionsAttacked", [minion, target]);

            let dmgTarget = true;
            let dmgMinion = true;

            if (minion.immune || minion.dormant) dmgMinion = false;

            if (dmgMinion && minion.keywords.includes("Divine Shield")) {
                minion.removeKeyword("Divine Shield");
                dmgMinion = false;
            }

            if (dmgMinion) minion.remStats(0, target.getAttack());

            if (dmgMinion && minion.getHealth() > 0) minion.activate("frenzy");

            if (minion.keywords.includes("Stealth")) minion.removeKeyword("Stealth");
        
            minion.activate("onattack");
            this.stats.update("minionsAttacked", [minion, target]);
        
            if (dmgMinion && target.keywords.includes("Poisonous")) minion.setStats(minion.getAttack(), 0);

            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");
                dmgTarget = false;
            }

            if (dmgTarget && minion.keywords.includes("Lifesteal")) minion.plr.addHealth(minion.getAttack());
            if (dmgTarget && minion.keywords.includes("Poisonous")) target.setStats(target.getAttack(), 0);

            if (dmgTarget) target.remStats(0, minion.getAttack())

            if (target.getHealth() > 0) target.activate("frenzy");
            if (target.getHealth() < 0) minion.activate("overkill");
            if (target.getHealth() == 0) minion.activate("honorablekill");

            this.killMinions();

            return true;
        }
    }
}

exports.Game = Game;
exports.GameStats = GameStats;