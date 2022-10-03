const rl = require('readline-sync');
const { Functions, Player } = require("./other");
const { Card } = require("./card");
const { printName } = require("./interact");

class GameStats {
    constructor(game) {
        this.game = game;

        /*this.spellsCast = [[], []];
        this.spellsCastOnMinions = [[], []];
        this.minionsPlayed = [[], []];
        this.minionsKilled = [[], []];
        this.minionsAttacked = [[], []];
        this.minionsThatAttacked = [[], []];
        this.minionsThatAttackedHero = [[], []];
        this.turnStarts = [[], []];
        this.turnEnds = [[], []];
        this.heroAttacked = [[], []];
        this.heroAttacks = [[], []];
        this.heroPowers = [[], []];
        this.fatalDamageTimes = [[], []];
        this.enemyAttacks = [[], []];
        this.restoredHealth = [[], []];
        this.cardsAddedToHand = [[], []];
        this.cardsAddedToDeck = [[], []];
        this.cardsDiscarded = [[], []];
        this.cardsDrawn = [[], []];
        this.cardsPlayed = [[], []];
        this.minionsSummoned = [[], []];
        this.unspentMana = [[], []];
        this.cardsDrawnThisTurn = [[], []];
        this.heroAttackGained = [[], []];
        this.spellsThatDealtDamage = [[], []];
        this.damageTakenOnOwnTurn = [[], []];*/

        this.jadeCounter = 0;
    }

    cardUpdate(key, val) {
        this.game.player.getHand().forEach(p => {
            // Infuse
            if (key == "minionsKilled" && val.plr == this.game.player && p.infuse_num >= 0) {
                p.setDesc(p.desc.replace(`Infuse (${p.infuse_num})`, `Infuse (${p.infuse_num - 1})`));
                p.infuse_num -= 1;

                if (p.infuse_num == 0) {
                    p.activateDefault("infuse");
                    p.setDesc(p.desc.replace(`Infuse (${p.infuse_num})`, "Infused"));
                }
            }
        });

        this.game.getBoard().forEach(p => {
            p.forEach(m => {
                m.activateDefault("unpassive", true);
                m.activateDefault("passive", [key, val]);
            });
        });
        
        if (this.game.player1.weapon) {
            this.game.player1.weapon.activateDefault("unpassive", true);
            this.game.player1.weapon.activateDefault("passive", [key, val]);
        }
        if (this.game.player2.weapon) {
            this.game.player2.weapon.activateDefault("unpassive", true);
            this.game.player2.weapon.activateDefault("passive", [key, val]);
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

                    if (quests_name == "secrets") game.input("\nYou triggered the opponents's '" + s.name + "'.\n");

                    if (s["next"]) new Card(s["next"], plr).activateDefault("cast");
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
        this.functions = functions;
        this.stats = new GameStats(this);
        this.input = rl.question;

        this.player1.id = 0;
        this.player2.id = 1;

        this.turns = 0;
        this.winner = null;
        this.loser = null;
        this.board = [[], []];

        this.passives = [];
        
        this.player1.setGame(this);
        this.player2.setGame(this);
    }

    set(key, val) {
        this[key] = val;
    }

    activatePassives(trigger) {
        let ret = [];
        this.passives.forEach(i => ret.push(i(this, trigger)));
        return ret;
    }

    getPlayer1() {
        return this.player1;
    }

    getPlayer2() {
        return this.player2;
    }

    getPlayer() {
        return this.player;
    }

    getOpponent() {
        return this.opponent;
    }

    getTurns() {
        return this.turns;
    }

    getWinner() {
        return this.winner;
    }

    getLoser() {
        return this.loser;
    }

    getBoard() {
        return this.board;
    }

    setPlayer1(player1) {
        this.player1 = player1;
    }

    setPlayer2(player2) {
        this.player2 = player2;
    }

    setPlayer(player) {
        this.player = player;
    }

    setOpponent(opponent) {
        this.opponent = opponent;
    }

    setTurns(turns) {
        this.turns = turns;
    }

    setWinner(winner) {
        this.winner = winner;
    }

    setLoser(loser) {
        this.loser = loser;
    }

    setBoard(board) {
        this.board = board;
    }

    plrNameToIndex(name) {
        if (this.player1.getName() == name) return 0;
        if (this.player2.getName() == name) return 1;
        
        return -1;
    }

    plrIndexToName(index) {
        if (index == 0) return this.player1.getName();
        if (index == 1) return this.player2.getName();

        return null;
    }

    plrIndexToPlayer(index) {
        if (index == 0) return this.player1;
        if (index == 1) return this.player2;
    }

    getOtherPlayer(player) {
        if (player == this.player1) return this.player2;
        if (player == this.player2) return this.player1;
    }

    startGame() {
        let plr1_hand = [];
        let plr2_hand = [];

        this.player1.deck.forEach((c) => {
            if (c.desc.includes("Quest: ") || c.desc.includes("Questline: ")) {
                plr1_hand.push(c);
                this.player1.deck.splice(this.player1.deck.indexOf(c), 1);
            }
        });
        this.player2.deck.forEach((c) => {
            if (c.desc.includes("Quest: ") || c.desc.includes("Questline: ")) {
                plr2_hand.push(c);
                this.player2.deck.splice(this.player2.deck.indexOf(c), 1);
            }
        });

        this.player1.setHand(plr1_hand);
        this.player2.setHand(plr2_hand);

        while (this.player1.hand.length < 3) {
            this.player1.drawCard(false);
        }

        while (this.player2.hand.length < 4) {
            this.player2.drawCard(false);
        }
        this.functions.addToHand(new Card("The Coin", this.player2), this.player2, false)

        this.player1.setMaxMana(1);
        this.player1.setMana(1);

        this.turns += 1;

        this.player1.deck.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame");
            }
        });
        this.player2.deck.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame");
            }
        });

        this.player1.hand.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame");
            }
        });
        this.player2.hand.forEach(c => {
            if (c.getType() == "Minion") {
                c.activateDefault("startofgame");
            }
        });
    }

    endGame(p) {
        printName();

        console.log(`Player ${p.getName()} wins!`);

        exit(0);
    }

    endTurn() {
        this.stats.update("turnEnds", this.turns);
        this.stats.cardsDrawnThisTurn[this.player.id] = [];

        if (this.player.mana > 0) {
            this.stats.update("unspentMana", this.player.mana);
        }

        this.getBoard()[this.player.id].forEach(m => {
            m.activateDefault("endofturn");
        });

        let _c = this.player1.hand.filter(c => !c.echo)
        this.player1.setHand(_c);

        _c = this.player2.hand.filter(c => !c.echo)
        this.player2.setHand(_c);

        this.player.attack = 0;
        this.player = this.opponent;

        this.player.setMaxMana(this.player.getMaxMana() + 1);
        this.player.setMana(this.player.getMaxMana());

        this.opponent = this.getOtherPlayer(this.player);

        this.turns += 1;
    }

    startTurn() {
        this.stats.update("turnStarts", this.turns);

        printName()

        if (this.player.weapon && this.player.weapon.stats[0]) {
            this.player.attack += this.player.weapon.stats[0];
        }

        this.player.mana -= this.player.overload;
        this.player.overload = 0;

        if (this.player1.weapon && this.player == this.player1) {
            this.player1.weapon.activateDefault("startofturn");
        }
        if (this.player2.weapon && this.player == this.player2) {
            this.player2.weapon.activateDefault("startofturn");
        }

        this.getBoard()[this.plrNameToIndex(this.player.getName())].forEach(m => {
            m.activateDefault("startofturn");
            m.canAttackHero = true;
            m.resetAttackTimes();

            if (m.stealthDuration > 0 && this.turns > m.stealthDuration) {
                m.stealthDuration = 0;
                m.removeKeyword("Stealth");
            }

            if (m.dormant) {
                if (this.turns > m.dormant) {
                    m.dormant = false;
                    m.frozen = false;
                    m.immune = false;

                    m.activateBattlecry();
                }

                m.turn = this.turns;
            } else {
                m.frozen = false;
            }
        });

        if (this.player.weapon && this.player.weapon.stats[0]) this.player.weapon.resetAttackTimes();

        this.player.drawCard();

        this.player.canUseHeroPower = true;
        this.player.hasPlayedCardThisTurn = false;
    }

    playCard(card, player) {
        if (player.getMana() < card.getMana()) {
            return false;
        }

        if (card.keywords.includes("Tradeable")) {
            var q = this.input(`Would you like to trade ${card.displayName} for a random card in your deck? (y: trade / n: play) `);

            if (q.startsWith("y")) {
                if (player.getMana() < 1) {
                    return false;
                }

                player.setMana(player.getMana() - 1);

                player.shuffleIntoDeck(card);

                var n = []

                var found = false;

                player.getHand().forEach(function(c) {
                    if (c.displayName === card.displayName && !found) {
                        found = true;
                    } else {
                        n.push(c);
                    }
                });

                if (card.type == "Spell" && card.keywords.includes("Twinspell")) {
                    card.removeKeyword("Twinspell");
                    card.setDesc(card.getDesc().split("Twinspell")[0].trim());
        
                    n.push(card);
                }
        
                if (card.keywords.includes("Echo")) {
                    let clone = Object.assign(Object.create(Object.getPrototypeOf(card)), card)
                    clone.echo = true;
        
                    n.push(clone);
                }
        
                player.setHand(n);

                player.drawCard();
                return false;
            }
        }

        player.setMana(player.getMana() - card.getMana());
        card.setMana(card._mana);
        
        var n = []

        var found = false;

        player.getHand().forEach(function(c) {
            if (c.displayName === card.displayName && !found) {
                found = true;
            } else {
                n.push(c);
            }
        });

        if (card.type == "Spell" && card.keywords.includes("Twinspell")) {
            card.removeKeyword("Twinspell");
            card.setDesc(card.getDesc().split("Twinspell")[0].trim());

            n.push(card);
        }

        if (card.keywords.includes("Echo")) {
            let clone = Object.assign(Object.create(Object.getPrototypeOf(card)), card)
            clone.echo = true;

            n.push(clone);
        }

        player.setHand(n);

        if (card.getType() == "Minion" && this.board[player.id].length > 0 && card.keywords.includes("Magnetic")) {
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
                    loc.addStats(card.stats[0], card.stats[1]);

                    card.keywords.forEach(k => {
                        loc.addKeyword(k);
                    });

                    loc.oghealth += card.oghealth;

                    card.deathrattles.forEach(d => {
                        loc.addDeathrattle(d);
                    });

                    return true;
                }
            }

        }

        if (card.getType() === "Minion") {
            if (player.counter && player.counter.includes("Minion")) {
                player.counter.splice(player.counter.indexOf("Minion"), 1);
    
                this.input("Your minion has been countered.\n")
    
                return;
            }
    
            if (this.board[player.id].length >= 7) {
                this.input("\nYou can only have 7 minions on the board.\n");
                this.functions.addToHand(card, player, false);
                player.mana += card.mana;
                return;
            }

            if (card.dormant) {
                card.frozen = true;
                card.immune = true;
                card.dormant = card.dormant + this.turns;
            } else {
                if (card.activateBattlecry() === -1) {
                    this.functions.addToHand(card, player, false);
                    player.mana += card.mana;
                    return;
                }
            }

            this.stats.update("minionsPlayed", card);

            this.playMinion(card, player, false);
        } else if (card.getType() === "Spell") {
            if (player.counter && player.counter.includes("Spell")) {
                player.counter.splice(player.counter.indexOf("Spell"), 1);

                this.input("Your spell has been countered.\n")

                return;
            }

            if (card.activateDefault("cast") === -1) {
                this.functions.addToHand(card, player, false);
                player.mana += card.mana;
                return;
            }

            this.stats.update("spellsCast", card);

            this.getBoard()[this.plrNameToIndex(player.getName())].forEach(m => {
                m.activate("spellburst", null, () => m.hasSpellburst = false, m.plr, this, m);
            });
        } else if (card.getType() === "Weapon") {
            player.setWeapon(card);

            card.activateBattlecry();
        } else if (card.getType() === "Hero") {
            player.setHero(card, 5);

            card.activateBattlecry();
        }

        if (player.hasPlayedCardThisTurn) {
            card.activateDefault("combo");
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

                    let t = null;
                    
                    eval(`t = new ${c.type}(c.corrupt, c.plr)`);

                    this.functions.addToHand(t, c.plr, false);

                    return;
                }
            }
        });

        if (corrupted) {
            var n = []

            var found = false;

            this.player.getHand().forEach(function(c) {
                if (c.displayName === corrupted.displayName && !found) {
                    found = true;
                } else {
                    n.push(c);
                }
            });

            player.setHand(n);
        }
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

            return;
        }

        this.board[p].push(minion);

        if (summoned) {
            this.stats.update("minionsSummoned", minion);
        }

        this.getBoard()[p].forEach(m => {
            m.keywords.forEach(k => {
                if (k.startsWith("Spell Damage +")) {
                    player.spellDamage += parseInt(k.split("+")[1]);
                }
            });
        });
    }

    killMinions() {
        for (var p = 0; p <= 1; p++) {
            var n = [];
            
            this.getBoard()[p].forEach(m => {
                if (m.getStats()[1] <= 0) {
                    m.activateDefault("deathrattle");
                }
            });

            this.getBoard()[p].forEach(m => {
                if (m.getStats()[1] <= 0) {
                    this.stats.update("minionsKilled", m);

                    if (m.keywords.includes("Reborn")) {
                        let minion = new Card(m.getName(), this.plrIndexToPlayer(p));

                        minion.removeKeyword("Reborn");
                        minion.setStats(minion.stats[0], 1);

                        this.playMinion(minion, this.plrIndexToPlayer(p), false);

                        n.push(minion);
                    } else {
                        m.activateDefault("unpassive", false);
                    }
                } else {
                    n.push(m);
                }
            });

            this.board[p] = n;
        }
    }

    attackMinion(minion, target) {
        if (minion instanceof Card && minion.frozen || minion instanceof Player && minion.frozen) return false;

        // Check if there is a minion with taunt
        var prevent = false;

        this.getBoard()[this.opponent.id].forEach(m => {
            if (m.keywords.includes("Taunt") && m != target) {
                prevent = true;
                return;
            }
        });

        if (prevent || target.immune) return false;

        if (!isNaN(minion)) {
            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");

                return false;
            }

            target.remStats(0, minion)

            if (target.stats[1] > 0) {
                target.activateDefault("frenzy");
            }

            this.killMinions();

            return;
        } else if (minion.attackTimes > 0) {
            if (minion.getStats()[0] <= 0) return false;

            minion.attackTimes--;

            this.stats.update("enemyAttacks", [minion, target]);
            this.stats.update("minionsThatAttacked", [minion, target]);
            this.stats.update("minionsAttacked", [minion, target]);

            minion.remStats(0, target.stats[0]);

            if (minion.keywords.includes("Divine Shield")) {
                minion.removeKeyword("Divine Shield");
                return false;
            }

            if (minion.stats[1] > 0) minion.activateDefault("frenzy");

            if (minion.keywords.includes("Stealth")) minion.removeKeyword("Stealth");
        
            minion.activateDefault("onattack");
            this.stats.update("minionsAttacked", [minion, target]);
        
            if (target.keywords.includes("Poisonous")) minion.setStats(minion.stats[0], 0);

            if (target.keywords.includes("Divine Shield")) {
                target.removeKeyword("Divine Shield");
                return false;
            }

            if (minion.keywords.includes("Lifesteal")) minion.plr.addHealth(minion.stats[0]);
            if (minion.keywords.includes("Poisonous")) target.setStats(target.stats[0], 0);

            target.remStats(0, minion.stats[0])

            if (target.getStats()[1] > 0) target.activateDefault("frenzy");
            if (target.getStats()[1] < 0) minion.activateDefault("overkill");
            if (target.getStats()[1] == 0) minion.activateDefault("honorablekill");

            return true;
        }
    }
}

exports.Game = Game;
exports.GameStats = GameStats;