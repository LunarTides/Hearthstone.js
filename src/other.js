let cards = {};
let game = null;

function setup(_cards, _game) {
    cards = _cards;
    game = _game;
}

class Player {
    constructor(name) {
        this.name = name;
        this.id = null;
        this.deck = [];
        this.hand = [];
        this.mana = 0;
        this.maxMana = 0;
        this.maxMaxMana = 10;
        this.game = null;
        this.health = 30;
        this.maxHealth = this.health;
        this.attack = 0;
        this.armor = 0;
        this.class = "Mage";
        this.hero_power = this.class;
        this.hero = "";
        this.heroPowerCost = 2;
        this.canUseHeroPower = true;
        this.weapon = null;
        this.fatigue = 0;
        this.hasPlayedCardThisTurn = false;
        this.frozen = false;
        this.immune = false;
        this.overload = 0;
        this.spellDamage = 0;
        this.counter = [];
        this.secrets = [];
        this.sidequests = [];
        this.quests = [];
        this.questlines = [];
    }

    getOpponent() {
        const id = (this.id == 0) ? 2 : 1;

        return game["player" + id];
    }

    setClass(_class, hp = true) {
        this.class = _class;
        if (hp) this.hero_power = _class;
    }

    setMaxMana(maxMana) {
        this.maxMana = maxMana;

        if (maxMana > this.maxMaxMana) this.maxMana = this.maxMaxMana;
    }

    refreshMana(mana) {
        this.mana += mana;

        if (this.mana > this.maxMana) this.mana = this.maxMana;
    }

    gainEmptyMana(mana) {
        this.maxMana += mana;
    }

    gainMana(mana) {
        this.gainEmptyMana(mana);
        this.refreshMana(mana);
    }

    gainOverload(overload) {
        this.overload += overload;

        const plus = this.maxMana == this.maxMaxMana ? 0 : 1;

        if (this.overload > this.mana + plus) this.overload = this.mana + plus;
    }

    setWeapon(weapon) {
        this.weapon = weapon;

        this.attack += weapon.getAttack();
    }

    destroyWeapon(triggerDeathrattle = false) {
        if (!this.weapon) return false;

        if (triggerDeathrattle) this.weapon.activate("deathrattle");
        this.weapon.destroy();
        this.weapon = null;
    }

    setHero(hero, armor = 5) {
        this.hero = hero;

        this.hero_power = "hero";

        this.armor += armor;
    }

    addAttack(amount) {
        this.attack += amount;

        game.stats.update("heroAttackGained", amount);
    }

    addHealth(amount) {
        this.health += amount;

        if (this.health > this.maxHealth) this.health = this.maxHealth;
    }

    remHealth(amount) {
        var a = amount;

        while (this.armor > 0 && a > 0) {
            a--;
            this.armor--;
        }

        if (a <= 0) return true;

        this.health -= a;

        if (game.player == this) {
            game.stats.update("damageTakenOnOwnTurn", amount);
        }

        if (this.health <= 0) {
            this.game.stats.update("fatalDamageTimes", 1);

            if (this.health <= 0) { // This is done to allow secrets to prevent death
                this.game.endGame(game.opponent);
            }
        }
    }

    shuffleIntoDeck(card, updateStats = true) {
        // Add the card into a random position in the deck
        var pos = this.game.functions.randInt(0, this.deck.length);
        this.deck.splice(pos, 0, card);

        if (updateStats) {
            this.game.stats.update("cardsAddedToDeck", card);
        }
    }

    addToBottomOfDeck(card) {
        this.deck = [card, ...this.deck];

        this.game.stats.update("cardsAddedToDeck", card);
    }

    drawCard(update = true) {
        if (this.deck.length <= 0) {
            this.fatigue++;

            this.remHealth(this.fatigue);
            
            return;
        }

        var card = this.deck.pop()

        if (card.type == "Spell") {
            if (card.activate("castondraw")) {
                return null;
            }
        }

        this.game.functions.addToHand(card, this, false);

        if (update) {
            game.stats.update("cardsDrawn", card);
            game.stats.update("cardsDrawnThisTurn", card);
        }

        return card;
    }

    heroPower() {
        if (this.hero_power == "Demon Hunter") this.heroPowerCost = 1;
        else this.heroPowerCost = 2; // This is to prevent changing hero power to demon hunter and changing back to decrease cost to 1

        if (this.mana < this.heroPowerCost || !this.canUseHeroPower) return false;

        if (this.hero && this.hero_power == "hero") {
            if (this.hero.activate("heropower") != -1) {
                this.game.board[this.id].forEach(m => {
                    m.activate("inspire");
                });

                this.mana = this.mana - this.heroPowerCost;

                game.stats.update("heroPowers", this.hero_power);

                this.canUseHeroPower = false;
            }

            return true;
        }

        if (this.hero_power == "Demon Hunter") {
            this.addAttack(1);
        }
        else if (this.hero_power == "Druid") {
            this.addAttack(1);
            this.armor += 1;
        }
        else if (this.hero_power == "Hunter") {
            this.game.opponent.remHealth(2);
        }
        else if (this.hero_power == "Mage") {
            // dontupdate means prevent selectting an elusive target, but don't update
            // game.stats.spellsCastOnMinions
            // dontupdate can really be any value as long as it is not true or false
            var t = this.game.functions.selectTarget("Deal 1 damage.", "dontupdate");

            if (!t) return false;

            if (t instanceof Player) {
                t.remHealth(1);
            } else {
                game.attackMinion(1, t);
            }
        }
        else if (this.hero_power == "Paladin") {
            game.playMinion(new game.Card("Silver Hand Recruit", this), this);
        }
        else if (this.hero_power == "Priest") {
            var t = this.game.functions.selectTarget("Restore 2 health.", "dontupdate");

            if (!t) return false;

            t.addHealth(2);
        }
        else if (this.hero_power == "Rogue") {
            this.weapon = new game.Card("Wicked Knife", this);
        }
        else if (this.hero_power == "Shaman") {
            const totem_cards = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];

            game.board[this.id].forEach(m => {
                if (totem_cards.includes(m.displayName)) {
                    totem_cards.splice(totem_cards.indexOf(m.displayName), 1);
                }
            });

            if (totem_cards.length == 0) {
                return;
            }

            game.playMinion(new game.Card(game.functions.randList(totem_cards), this), this);
        }
        else if (this.hero_power == "Warlock") {
            this.remHealth(2);

            this.drawCard();
        }
        else if (this.hero_power == "Warrior") {
            this.armor += 2;
        }

        this.game.board[this.id].forEach(m => {
            m.activate("inspire");
        });

        this.mana -= this.heroPowerCost;

        game.stats.update("heroPowers", this.hero_power);

        this.canUseHeroPower = false;

    }

}

class Functions {
    // https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj - Vladyslav
    shuffle(array) {
        const newArray = [...array]
        const length = newArray.length

        for (let start = 0; start < length; start++) {
            const randomPosition = this.randInt(0, (newArray.length - start) - 1);
            const randomItem = newArray.splice(randomPosition, 1)

            newArray.push(...randomItem)
        }

        return newArray
    }

    randList(list) {
        return list[this.randInt(0, list.length - 1)];
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    capitalize(str) {
        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }

    getType(card) {
        if (card.tribe) { // If you see this in the error log, the error occorred since the game failed to get the type of a minion. Error Code: #21
            return "Minion";
        } else if (card.stats) {
            return "Weapon";
        } else if (card.heropower) {
            return "Hero";
        } else {
            return "Spell";
        }
    }

    getCardByName(name) {
        return Object.values(game.cards).find(c => c.name.toLowerCase() == name.toLowerCase());
    }

    progressQuest(name, value) {
        let quest = game.player.secrets.find(s => s["name"] == name);
        if (!quest) quest = game.player.sidequests.find(s => s["name"] == name);
        if (!quest) quest = game.player.quests.find(s => s["name"] == name);
        if (!quest) quest = game.player.questlines.find(s => s["name"] == name);

        quest["progress"][0] += value;
    }

    createJade(plr) {
        if (game.stats.jadeCounter < 30) game.stats.jadeCounter += 1;
        const count = game.stats.jadeCounter;
        const mana = (count < 10) ? count : 10;

        let jade = new game.Card("Jade Golem", plr);
        jade.setStats(count, count);
        jade.mana = mana;

        return jade;
    }

    recruit(amount = 1, mana_range = [0, 10]) {
        var array = this.shuffle(game.player.deck)

        var times = 0;

        array.forEach(c => {
            if (c.type == "Minion" && c.mana >= mana_range[0] && c.mana <= mana_range[1] && times < amount) {
                game.playMinion(new game.Card(c.name, game.player), game.player);

                times++;

                return c;
            }
        });
    }

    chooseOne(prompt, options, times = 1) {
        let choices = [];

        for (var i = 0; i < times; i++) {
            var p = `\n${prompt} [`;

            options.forEach((v, i) => {
                p += `${i + 1}: ${v}, `;
            });

            p = p.slice(0, -2);
            p += "] ";

            var choice = game.input(p);

            choices.push(parseInt(choice) - 1);
        }

        if (times === 1) {
            return choices[0];
        } else {
            return choices;
        }
    }

    spellDmg(target, damage) {
        const dmg = this.accountForSpellDmg(damage);

        game.stats.update("spellsThatDealtDamage", [target, dmg]);

        if (target instanceof game.Card) {
            game.attackMinion(dmg, target);
        } else if (target instanceof Player) {
            target.remHealth(dmg);
        }
    }

    accountForSpellDmg(damage) {
        return damage + game.player.spellDamage;
    }

    accountForUncollectible(cards) {
        return cards.filter(c => !c.uncollectible);
    }

    addToHand(card, player, updateStats = true) {
        if (player.hand.length < 10) {
            player.hand.push(card);
        
            if (updateStats) game.stats.update("cardsAddedToHand", card);
        }
    }

    discover(prompt, amount = 3, flags = [], add_to_hand = true, _cards = []) {
        let values = _cards;

        if (_cards.length == 0) {
            let possible_cards = [];

            Object.entries(cards).forEach((c, _) => {
                c = c[1];
                let type = this.getType(c);

                if (type == "Spell" && c.class == "Neutral") {}
                else if (c.class === game.player.class || c.class == "Neutral") {
                    if (flags.includes("Minion") && type !== "Minion") return;
                    if (flags.includes("Spell") && type !== "Spell") return;
                    if (flags.includes("Weapon") && type !== "Weapon") return;

                    possible_cards.push(c);
                }
            });

            possible_cards = this.accountForUncollectible(possible_cards);

            if (possible_cards.length == 0) return;

            for (var i = 0; i < amount; i++) {
                var c = game.functions.randList(possible_cards);

                values.push(c);
                possible_cards.splice(possible_cards.indexOf(c), 1);
            }
        }

        var p = `\n${prompt}\n[\n`;

        if (values.length <= 0) return;

        values.forEach((v, i) => {
            let stats = this.getType(v) == "Minion" ? ` [${v.getAttack()} / ${v.getHealth()}]` : "";
            let desc = `(${v.desc})` || "";

            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: {${v.mana}} ${v.displayName || v.name}${stats} ${desc} (${this.getType(v)}),\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        var choice = game.input(p);

        if (!values[parseInt(choice) - 1]) {
            return this.discover(prompt, amount, flags, add_to_hand, values);
        }

        var card = values[parseInt(choice) - 1];

        if (add_to_hand) {
            var c = new game.Card(card.name, game.player);

            this.addToHand(c, game.player);

            return c;
        } else {
            return card;
        }
    }

    selectTarget(prompt, elusive = false, force_side = null, force_class = null) {
        // force_class = [null, "hero", "minion"]
        // force_side = [null, "enemy", "self"]

        if (force_class == "hero") {
            const target = game.input(`Do you want to select the enemy hero, or your own hero? (y: enemy, n: self) `);
    
            return (target.startsWith("y")) ? game.opponent : game.player;
        }

        let p = `\n${prompt} (`;
        if (force_class == null) p += "type 'face' to select a hero | ";
        p += "type 'back' to go back) ";

        const target = game.input(p);

        if (target.startsWith("b")) {
            const return_question = game.input(`WARNING: Going back might cause unexpected things to happen. Do you still want to go back? (y / n) `);
            
            if (return_question.startsWith("y")) return false;
        }

        const board_next = game.board[game.opponent.id];
        const board_self = game.board[game.player.id];

        const board_next_target = board_next[parseInt(target) - 1];
        const board_self_target = board_self[parseInt(target) - 1];

        let minion = undefined;

        if (!target.startsWith("face") && !board_self_target && !board_next_target) {
            // target != "face" and target is not a minion.
            // The input is invalid

            return this.selectTarget(prompt, elusive, force_side, force_class);
        }

        if (force_side) {
            if (target.startsWith("face") && force_class != "minion") {
                if (force_side == "enemy") return game.opponent;

                return game.player;
            }

            minion = (force_side == "enemy") ? board_next_target : board_self_target;
        } else {
            if (target.startsWith("face") && force_class != "minion") return this.selectTarget(prompt, false, null, "hero");
            
            if (board_next.length >= parseInt(target) && board_self.length >= parseInt(target)) {
                // Both players have a minion with the same index.
                // Ask them which minion to select
                var target2 = game.input(`Do you want to select your opponent's (${board_next_target.displayName}) or your own (${board_self_target.displayName})? (y: opponent, n: self | type 'back' to go back) `);
            
                if (target2.startsWith("b")) {
                    // Go back.
                    return this.selectTarget(prompt, elusive, force_side, force_class);
                }

                minion = (target2.startsWith("y")) ? board_next_target : board_self_target;
            } else {
                minion = board_next.length >= parseInt(target) ? board_next_target : board_self_target;
            }
        }

        if (minion === undefined) {
            console.log("Invalid minion");
            return false;
        }

        if (minion.keywords.includes("Elusive") && elusive) {
            game.input("Can't be targeted by Spells or Hero Powers");
            
            // elusive can be set to any value other than true to prevent targetting but not update
            // spells cast on minions
            if (elusive === true) {
                game.stats.update("spellsCastOnMinions", m);
            }
            return false;
        }

        if (minion.keywords.includes("Stealth") && game.player != minion.plr) {
            console.log("This minion has stealth");

            return false;
        }

        return minion;
    }

    dredge(prompt = "Choose One:") {
        // Look at the bottom three cards of the deck and put one on the top.
        var cards = game.player.deck.slice(0, 3);

        var p = `\n${prompt}\n[`;

        if (cards.length <= 0) return;

        cards.forEach((c, i) => {
            p += `${i + 1}: ${c.displayName}, `;
        });

        p = p.slice(0, -2);

        p += "] ";

        var choice = game.input(p);

        if (!cards[parseInt(choice) - 1]) {
            printAll(game.player);

            return this.dredge(prompt);
        }

        var card = cards[parseInt(choice) - 1];

        game.player.shuffleIntoDeck(card);
        game.player.deck.splice(game.player.deck.indexOf(card), 1);

        return card;
    }

    adapt(minion, prompt = "Choose One:") {
        var possible_cards = [
            ["Crackling Shield", "Divine Shield"],
            ["Flaming Claws", "+3 Attack"],
            ["Living Spores", "Deathrattle: Summon two 1/1 Plants."],
            ["Lightning Speed", "Windfury"],
            ["Liquid Membrane", "Can't be targeted by spells or Hero Powers."],
            ["Massive", "Taunt"],
            ["Volcanic Might", "+1/+1"],
            ["Rocky Carapace", "+3 Health"],
            ["Shrouding Mist", "Stealth until your next turn."],
            ["Poison Spit", "Poisonous"]
        ];
        var values = [];

        for (var i = 0; i < 3; i++) {
            var c = game.functions.randList(possible_cards);

            values.push(c);
            possible_cards.splice(possible_cards.indexOf(c), 1);
        }

        var p = `\n${prompt}\n[\n`;

        values.forEach((v, i) => {
            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: ${v[0]}; ${v[1]},\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        var choice = game.input(p);

        switch (values[parseInt(choice) - 1][0]) {
            case "Crackling Shield":
                minion.addKeyword("Divine Shield");

                break;
            case "Flaming Claws":
                minion.addStats(3, 0);

                break;
            case "Living Spores":
                minion.addDeathrattle((plr, game) => {
                    game.playMinion(new game.Card("Plant"), plr);
                    game.playMinion(new game.Card("Plant"), plr);
                });

                break;
            case "Lightning Speed":
                minion.addKeyword("Windfury");

                break;
            case "Liquid Membrane":
                minion.addKeyword("Elusive");

                break;
            case "Massive":
                minion.addKeyword("Taunt");

                break;
            case "Volcanic Might":
                minion.addStats(1, 1);

                break;
            case "Rocky Carapace":
                minion.addStats(0, 3);

                break;
            case "Shrouding Mist":
                minion.addKeyword("Stealth");
                minion.setStealthDuration(1);

                break;
            case "Poison Spit":
                minion.addKeyword("Poisonous");

                break;
            default:
                break;
        }
    }

    invoke(plr) {
        // Filter all cards in "plr"'s deck with a name that starts with "Galakrond, the "
        
        // --- REMOVE FOR DEBUGGING ---
        var cards = plr.deck.filter(c => c.displayName.startsWith("Galakrond, the "));
        if (cards.length <= 0) return;
        // ----------------------------

        switch (plr.class) {
            case "Priest":
                // Add a random Priest minion to your hand.
                var possible_cards = cards.filter(c => this.getType(c) == "Minion" && c.class == "Priest");
                if (possible_cards.length <= 0) return;

                var card = game.functions.randList(possible_cards);
                this.addToHand(card, plr);

                break;
            case "Rogue":
                // Add a Lackey to your hand.
                const lackey_cards = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

                this.addToHand(new game.Card(game.functions.randList(lackey_cards)), plr);

                break;
            case "Shaman":
                // Summon a 2/1 Elemental with Rush.
                game.playMinion(new game.Card("Windswept Elemental", plr), plr);

                break;
            case "Warlock":
                // Summon two 1/1 Imps.
                game.playMinion(new game.Card("Draconic Imp", plr), plr);
                game.playMinion(new game.Card("Draconic Imp", plr), plr);

                break;
            case "Warrior":
                // Give your hero +3 Attack this turn.                
                plr.addAttack(3);

                break;
            default:
                break;
        }
    }

    addSecret(plr, card, key, val, callback, fake_val = null, manual_progression = false) {
        if (plr.secrets.length >= 3 || plr.secrets.filter(s => s.displayName == card.displayName).length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }

        if (fake_val) val = fake_val;

        plr.secrets.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "fake_val": fake_val, "manual_progression": manual_progression});
    }
    addSidequest(plr, card, key, val, callback, fake_val = null, manual_progression = false) {
        if (plr.sidequests.length >= 3 || plr.sidequests.filter(s => s.displayName == card.displayName).length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }

        if (fake_val) val = fake_val;

        plr.sidequests.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "fake_val": fake_val, "manual_progression": manual_progression});
    }
    addQuest(plr, card, key, val, callback, fake_val = null, manual_progression = false) {
        if (plr.quests.length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }
        
        if (fake_val) val = fake_val;

        plr.quests.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "fake_val": fake_val, "manual_progression": manual_progression});
    }
    addQuestline(plr, card, key, val, callback, next, fake_val = null, manual_progression = false) {
        if (plr.questlines.length > 0) {
            this.addToHand(card, plr);
            plr.mana += card.mana;
            
            return false;
        }

        if (fake_val) val = fake_val;

        plr.questlines.push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "next": next, "manual_progression": manual_progression});
    }
}

exports.Functions = Functions;
exports.Player = Player;

exports.setup_other = setup;