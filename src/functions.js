const { setup_ai } = require("./ai");
const { setup_card } = require("./card");
const { setup_player } = require("./player");

let cards = {};
let game = null;

class Functions {
    constructor(_game) {
        game = _game;
    }

    // QoL
    // https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj - Vladyslav
    shuffle(array) {
        /**
         * Shuffle the array and return the result
         * 
         * @param {any[]} array Array to shuffle
         * 
         * @returns {any[]} Shuffeled array
         */

        const newArray = [...array];
        const length = newArray.length;

        for (let start = 0; start < length; start++) {
            const randomPosition = this.randInt(0, (newArray.length - start) - 1);
            const randomItem = newArray.splice(randomPosition, 1);

            newArray.push(...randomItem);
        }

        return newArray;
    }
    randList(list, cpyCard = true) {
        /**
         * Return a random element from "list"
         * 
         * @param {any[]} list
         * 
         * @returns {any} Item
         */

        let item = list[this.randInt(0, list.length - 1)];
        
        if (item instanceof game.Card && cpyCard) item = new game.Card(item.name, item.plr);

        return item;
    }
    randInt(min, max) {
        /**
         * Return a random number from "min" to "max"
         * 
         * @param {number} min The minimum number
         * @param {number} max The maximum number
         * 
         * @returns {number} The random number
         */

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    capitalize(str) {
        /**
         * Capitilizes and returns the string
         * 
         * @param {string} str String
         * 
         * @return {string} The string capitilized
         */

        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }

    // Getting card info
    getType(card) {
        /**
         * Returns the type of a card
         * 
         * @param {Card | Blueprint} card The card to check
         * 
         * @returns {string} The type of the card
         */

        if (card.cooldown) return "Location";
        
        else if (card.tribe) return "Minion"; // If you see this in the error log, the error occorred since the game failed to get the type of a minion. Error Code: #21
        else if (card.stats) return "Weapon";
        else if (card.heropower) return "Hero";
        else return "Spell";
    }
    getCardByName(name) {
        /**
         * Gets the card that has the same name as "name"
         * 
         * @param {string} name The name
         * 
         * @returns {Blueprint} The blueprint of the card
         */

        return this.getCards(false).find(c => c.name.toLowerCase() == name.toLowerCase());
    }
    getCards(uncollectible = true, cards = game.cards) {
        /**
         * Returns all cards
         *
         * @param {bool} uncollectible [default=true] Filter out all uncollectible cards
         * @param {Blueprint[]} cards [default=All cards in the game] The cards to get
         *
         * @returns {Blueprint[]} Cards
         */

        cards = Object.values(cards);

        if (uncollectible) cards = this.accountForUncollectible(cards);

        return cards;
    }
    colorByRarity(str, rarity, bold = false) {
        /**
         * Colors "str" based on "rarity". Example: Rarity = "Legendary", return "str".gold
         *
         * @param {string} str The string to color
         * @param {string} rarity The rarity
         * @param {bool} bold Automatically apply bold
         *
         * @returns {string} The colored string
         */

        switch (rarity) {
            case "Common":
                str = str.gray;
                break;
            case "Rare":
                str = str.blue;
                break;
            case "Epic":
                str = str.brightMagenta;
                break;
            case "Legendary":
                str = str.yellow;
                break;
            default:
                break;
        }

        if (bold && rarity != "Legendary") str = str.bold;

        return str;
    }
    cloneObject(object) {
        /**
         * Clones the "object" and returns the clone
         * 
         * @param {object} object The object to clone
         * 
         * @returns {object} Clone
         */

        return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
    }
    cloneCard(card, plr) {
        /**
         * Clones a card, assigns it the to "plr", sets some essential properties
         * 
         * @param {Card} card The card to clone
         * @param {Player} plr The owner of the card
         * 
         * @returns {Card} Clone
         */

        let clone = this.cloneObject(card);

        clone.randomizeIds();
        clone.sleepy = true;
        clone.plr = plr;
        clone.turn = game.turns;

        return clone;
    }

    // Damage
    spellDmg(target, damage) {
        /**
         * Deals damage to "target" based on your spell damage
         * 
         * @param {Card | Player} target The target
         * @param {number} damage The damage to deal
         * 
         * @returns {number} The target's new health
         */

        const dmg = this.accountForSpellDmg(damage);

        game.stats.update("spellsThatDealtDamage", [target, dmg]);
        game.attack(dmg, target);

        return target.getHealth();
    }

    // Account for certain stats
    accountForSpellDmg(damage) {
        /**
         * Returns "damage" + The player's spell damage
         * 
         * @param {number} damage
         * 
         * @returns {number} Damage + spell damage
         */

        return damage + game.player.spellDamage;
    }
    accountForUncollectible(cards) {
        /**
         * Filters out all cards that are uncollectible in a list
         * 
         * @param {Card[] | Blueprint[]} cards The list of cards
         * 
         * @returns {Card[] | Blueprint[]} The cards without the uncollectible cards
         */

        return cards.filter(c => !c.uncollectible);
    }

    // Keyword stuff
    dredge(prompt = "Choose One:") {
        /**
         * Asks the user a "prompt" and show 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
         * 
         * @param {string} prompt [default="Choose One:"] The prompt to ask the user
         * 
         * @returns {Card} The card chosen
         */

        // Look at the bottom three cards of the deck and put one on the top.
        let cards = game.player.deck.slice(0, 3);

        let p = `\n${prompt}\n[`;

        if (cards.length <= 0) return;

        cards.forEach((c, i) => {
            p += `${i + 1}: ${c.displayName}, `;
        });

        p = p.slice(0, -2);

        p += "] ";

        let choice = game.input(p);

        if (!cards[parseInt(choice) - 1]) {
            game.interact.printAll(game.player);

            return this.dredge(prompt);
        }

        let card = cards[parseInt(choice) - 1];

        game.player.shuffleIntoDeck(card);
        game.player.deck.splice(game.player.deck.indexOf(card), 1);

        return card;
    }
    adapt(minion, prompt = "Choose One:", _values = []) {
        /**
         * Asks the user a "prompt" and show 3 choices for the player to choose, and do something to the minion based on the choice
         * 
         * @param {Card} minion The minion to adapt
         * @param {string} prompt [default="Choose One:"] The prompt to ask the user
         * 
         * @returns {string} The name of the adapt chosen. See the first values of possible_cards
         */

        let possible_cards = [
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
        let values = _values;

        if (values.length == 0) {
            for (let i = 0; i < 3; i++) {
                let c = game.functions.randList(possible_cards);

                values.push(c);
                possible_cards.splice(possible_cards.indexOf(c), 1);
            }
        }

        let p = `\n${prompt}\n[\n`;

        values.forEach((v, i) => {
            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: ${v[0]}; ${v[1]},\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        let choice = game.input(p);
        if (parseInt(choice) > 3) return adapt(minion, prompt, values);

        choice = values[parseInt(choice) - 1][0];

        switch (choice) {
            case "Crackling Shield":
                minion.addKeyword("Divine Shield");

                break;
            case "Flaming Claws":
                minion.addStats(3, 0);

                break;
            case "Living Spores":
                minion.addDeathrattle((plr, game) => {
                    game.summonMinion(new game.Card("Plant"), plr);
                    game.summonMinion(new game.Card("Plant"), plr);
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

        return choice;
    }
    invoke(plr) {
        /**
         * Call invoke on the player
         * 
         * @param {Player} plr The player
         * 
         * @returns {undefined}
         */

        // Filter all cards in "plr"'s deck with a name that starts with "Galakrond, the "
        
        // --- REMOVE FOR DEBUGGING ---
        let cards = plr.deck.filter(c => c.displayName.startsWith("Galakrond, the "));
        if (cards.length <= 0) return;
        // ----------------------------

        switch (plr.heroClass) {
            case "Priest":
                // Add a random Priest minion to your hand.
                let possible_cards = cards.filter(c => this.getType(c) == "Minion" && c.class == "Priest");
                if (possible_cards.length <= 0) return;

                let card = game.functions.randList(possible_cards);
                plr.addToHand(card);

                break;
            case "Rogue":
                // Add a Lackey to your hand.
                const lackey_cards = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

                plr.addToHand(new game.Card(game.functions.randList(lackey_cards)), plr);

                break;
            case "Shaman":
                // Summon a 2/1 Elemental with Rush.
                game.summonMinion(new game.Card("Windswept Elemental", plr), plr);

                break;
            case "Warlock":
                // Summon two 1/1 Imps.
                game.summonMinion(new game.Card("Draconic Imp", plr), plr);
                game.summonMinion(new game.Card("Draconic Imp", plr), plr);

                break;
            case "Warrior":
                // Give your hero +3 Attack this turn.                
                plr.addAttack(3);

                break;
            default:
                break;
        }
    }
    recruit(plr = game.player, amount = 1, mana_range = [0, 10]) {
        /**
         * Put's a minion within "mana_range" from the plr's deck, into the board
         * 
         * @param {Player} plr [default=current player] The player
         * @param {number} amount [default=1] The amount of minions to recruit
         * @param {number[]} mana_range [default=[0, 10]] The minion recruited's mana has to be more than mana_range[0] and less than mana_range[1]
         * 
         * @returns {Card[]} Returns the cards recruited
         */

        let array = this.shuffle(plr.deck)

        let times = 0;

        let cards = [];

        array.forEach(c => {
            if (c.type == "Minion" && c.mana >= mana_range[0] && c.mana <= mana_range[1] && times < amount) {
                game.summonMinion(new game.Card(c.name, plr), plr);

                times++;
                cards.push(c);
            }
        });

        return cards;
    }

    createJade(plr) {
        /**
         * Creates and returns a jade golem with the correct stats and cost for the player
         * 
         * @param {Player} plr The jade golem's owner
         * 
         * @returns {Card} The jade golem
         */

        if (plr.jadeCounter < 30) plr.jadeCounter += 1;
        const count = plr.jadeCounter;
        const mana = (count < 10) ? count : 10;

        let jade = new game.Card("Jade Golem", plr);
        jade.setStats(count, count);
        jade.mana = mana;

        return jade;
    }
    _importCards(path) {
        /**
         * Imports all cards from a folder and returns the cards.
         * Don't use.
         * 
         * @param {string} path The path
         * 
         * @returns {undefined}
         */

        require("fs").readdirSync(path, { withFileTypes: true }).forEach(file => {
            let p = `${path}/${file.name}`;

            if (file.name.endsWith(".js")) {
                let f = require(p);
                
                cards[f.name] = f;
            }
            else if (file.isDirectory()) this._importCards(p);
        });
    }
    importCards(path) {
        /**
         * Imports all cards from a folder
         * 
         * @param {string} path The path
         * 
         * @returns {undefined}
         */

        this._importCards(path);

        game.set("cards", cards);
        setup_card(game, cards);
        setup_ai(game);
        setup_player(game);
    }
    importDeck(plr, code) {
        /**
         * Imports a deck using a code and put the cards into the player's deck
         * 
         * @param {Player} plr The player to put the cards into
         * @param {string} code The base64 encoded deck code
         * 
         * @returns {Card[]} The deck
         */

        // The code is base64 encoded, so we need to decode it
        code = Buffer.from(code, 'base64').toString('ascii');

        let hero = code.split("### ")[1].trim();
        code = code.split("### ")[2];

        plr.heroClass = hero;

        // Runes
        if (hero == "Death Knight" && /^\[[A-Z]{3}\]/.test(code)) {
            // [BFU]
            let runes = [];

            for (let i = 1; i <= 3; i++) {
                runes.push(code[i]);
            }
            
            code = code.slice(6);
            plr.runes = runes;
        }

        let deck = code.split(", ");
        let _deck = [];
    
        for (let i = 0; i < deck.length; i++) {
            let card = deck[i];

            let times = 1;
            if (/x\d+ /.test(card)) {
                times = card.slice(1);
                times = times.replace(/( \w+)+/, "");
            }

            let name = (times == 1) ? card : card.substring(times.length + 2);
            let m = new game.Card(name, plr);

            for (let i = 0; i < parseInt(times); i++) _deck.push(this.cloneCard(m, plr));
    
            let legendaryTest = (m.rarity == "Legendary" && times > 1);
            let validateTest = (game.interact.validateCard(m, plr));

            if (game.config.validateDecks && (validateTest !== true || legendaryTest)) {
                let err;

                switch (validateTest) {
                    case "class":
                        err = "You have a card from different class in your deck";
                        break;
                    case "uncollectible":
                        err = "You have an uncollectible card in your deck";
                        break;
                    case "runes":
                        err = "A card does not support your current runes";
                        break;
                }
                if (legendaryTest) err = "There are more than 1 of a legendary in this deck";
                game.input(`${err}.\nSpecific Card that caused the error: `.red + `${m.name}\n`.yellow);
                require("process").exit(1);
            }
        }

        let max = game.config.maxDeckLength;
        let min = game.config.minDeckLength;

        if (_deck.length < min || _deck.length > max) {
            game.input("The deck needs ".red + ((min == max) ? `exactly `.red + `${max}`.yellow : `between`.red + `${min}-${max}`.yellow) + ` cards. Your deck has: `.red + `${_deck.length}`.yellow + `.\n`.red);
            require("process").exit(1);
        }
    
        _deck = this.shuffle(_deck);

        plr.deck = _deck;

        return _deck;
    }
    mulligan(plr, input) {
        /**
         * Mulligans the cards from input. Read interact.mulligan for more info
         *
         * @param {Player} plr The player who mulligans
         * @param {String} input The ids of the cards to mulligan
         *
         * @returns {Card[]} The cards mulligan'd
         */

        let cards = [];
        let mulligan = [];

        input.split("").forEach(c => mulligan.push(plr.hand[parseInt(c) - 1]));

        plr.hand.forEach(c => {
            if (!mulligan.includes(c) || c.name == "The Coin") return;

            mulligan.splice(mulligan.indexOf(c), 1);
            
            plr.drawCard();
            plr.shuffleIntoDeck(c, false);
            plr.removeFromHand(c);

            cards.push(c);
        });

        return cards;
    }

    // Quest
    progressQuest(name, value = 1) {
        /**
         * Progress a quest by a value
         * 
         * @param {string} name The name of the quest
         * @param {number} value [default=1] The amount to progress the quest by
         * 
         * @returns {number} The new progress
         */

        let quest = game.player.secrets.find(s => s["name"] == name);
        if (!quest) quest = game.player.sidequests.find(s => s["name"] == name);
        if (!quest) quest = game.player.quests.find(s => s["name"] == name);

        quest["progress"][0] += value;

        return quest["progress"][0];
    }
    addQuest(type, plr, card, key, val, callback, next = null, manual_progression = false) {
        /**
         * Adds a quest / secrets to a player
         * 
         * @param {string} type The type of the quest: ["Quest", "Sidequest", "Secret"]
         * @param {Player} plr The player to add the quest to
         * @param {Card} card The quest / secret
         * @param {string} key The key of the quest
         * @param {any} val The value that the quest needs
         * @param {Function} callback The function to call when the key is invoked, arguments: {any[]} trigger [key, val] The trigger, {Game} game The game, {turn} The turn the quest was played, {boolean} normal_done If the game claims the quest is done
         * @param {string} next [default=null] The name of the next quest / sidequest / secret that should be added when the quest is done
         * @param {boolean} manual_progression [default=false] If the quest needs progressQuest function to be called to progress, or if it should do it automatically
         * 
         * @returns {undefined}
         */

        const t = plr[type.toLowerCase() + "s"];

        if ( (type.toLowerCase() == "quest" && t.length > 0) || ((type.toLowerCase() == "secret" || type.toLowerCase() == "sidequest") && (t.length >= 3 || t.filter(s => s.displayName == card.displayName).length > 0)) ) {
            plr.addToHand(card);
            plr.mana += card.mana;
            
            return false;
        }

        plr[type.toLowerCase() + "s"].push({"name": card.displayName, "progress": [0, val], "key": key, "value": val, "turn": game.turns, "callback": callback, "next": next, "manual_progression": manual_progression});
    }
}

exports.Functions = Functions;
