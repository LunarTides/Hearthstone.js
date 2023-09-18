/**
 * Card
 * @module Card
 */
import { Player } from "../internal.js";
import { Blueprint, CardAbility, CardClass, CardKeyword, CardRarity, CardType, CostType, EnchantmentDefinition, GameConfig, Ability, MinionTribe, SpellSchool, CardBackup } from "../types.js";
import { v4 as uuidv4 } from "uuid";

let game = globalThis.game;

export class Card {
    // All

    /**
     * This is the name of the card, it must be unique.
     * Please do not change this
     */
    name: string;

    /**
     * This is used instead of the name when displaying the card, this does not have to be unique.
     */
    displayName: string;

    /**
     * The card's description / text.
     * 
     * Might include color tags like `Example [033Example 2[142`.
     * Use `stripAnsi()` to remove these.
     */
    desc: string;

    /**
     * The cost of the card.
     */
    cost: number = 0;

    /**
     * This is the class that the card belongs to. E.g. "Warlock" or "Mage".
     */
    classes: CardClass[] = ["Neutral"];

    /**
     * This is the type of card, e.g. "Spell" or "Minion".
     */
    type: CardType = "Undefined";

    /**
     * This is the rarity of the card. E.g. "Common" | "Rare" | etc...
     */
    rarity: CardRarity = "Free";

    /**
     * The id tied to the blueprint of the card.
     * This differentiates cards from each other, but not cards with the same blueprint.
     * Use uuid for that.
     * 
     * @example
     * let sheep = new Card("Sheep", plr);
     * let another_sheep = new Card("Sheep", plr);
     * 
     * let the_coin = new Card("The Coin", plr);
     * 
     * assert.equal(sheep.id, another_sheep.id);
     * assert.notEqual(sheep.id, the_coin.id);
     */
    id: number = -1;

    /**
     * If the card is uncollectible.
     * - Uncollectible cards cannot be added to a deck, and cannot be found in card pools[1].
     * - Uncollectible cards can mostly only be explicitly created by other collectible cards.
     * 
     * [1] Unless explicitly stated otherwise
     */
    uncollectible: boolean = false;

    /**
     * The keywords that the card has. E.g. ["Taunt", "Divine Shield", etc...]
     */
    keywords: CardKeyword[] = [];

    /**
     * The card's blueprint.
     * This is the baseline of the card
     * 
     * Properties of this blueprint are set in this class.
     * For example, if the blueprint has a property called "foo", and it is set to 1, then the card will get a property called "foo", with value 1
     */
    blueprint: Blueprint;

    // Minion / Weapon
    
    stats?: [number, number];

    /**
     * The tribe the card belongs to.
     */
    tribe?: MinionTribe;

    /**
     * The number of times a minion can attack in a turn;
     * - Default: 1
     * - With Windfury: 2
     * - With Mega-Windfury: 4
     */
    attackTimes?: number = 1;

    /**
     * If this is true, the card is exhausted and so can't attack this turn.
     * 
     * Automatically gets set to true when the card attacks, and gets set to false at the end of the player's turn.
     */
    sleepy?: boolean = true;

    /**
     * The maximum health of the card.
     */
    maxHealth?: number;

    // Spell

    /**
     * If the card is a spell, this is the school of the spell. E.g. "Fire" or "Frost" or "Fel".
     */
    spellSchool?: SpellSchool;

    // Hero

    /**
     * The description of the hero power.
     */
    hpDesc: string = "PLACEHOLDER";

    /**
     * The cost of the hero power.
     */
    hpCost?: number = 2;

    // Location

    durability?: number;

    /**
     * The cooldown of the location card.
     */
    cooldown?: number = 2;

    // Not-null

    /**
     * The name of this class. This is if you are working with a type that is `Card | Player`.
     * In that case, this is `Card` if that type is `Card`, or `Player` if that type is `Player`.
     * 
     * But for types that are just `Card`, this is the literal string "Card".
     */
    classType: "Card" = "Card";

    /**
     * What currency this card costs.
     * If this is "mana", the card costs `Player.mana`.
     * If this is "armor", the card costs `Player.armor`.
     * If this is "health", the card costs `Player.health`.
     * etc...
     * 
     * This can be any value, as long as it is a defined _number_ in the `Player` class.
     */
    costType: CostType = "mana";

    /**
     * If the card is dormant | The turn that the dormant runs out
     */
    // TODO: Rewrite dormant
    dormant?: number;

    /**
     * If the card is frozen.
     * A frozen card cannot attack.
     */
    frozen: boolean = false;

    /**
     * If the card is immune.
     * An immune card cannot be targeted at all.
     */
    immune: boolean = false;

    /**
     * If the card is an echo.
     * - Echo cards can be played as many times as the player wants, as long as they have the resources.
     * - Echo cards get removed from the player's hand at the end of the turn.
     */
    echo: boolean = false;

    /**
     * Information stored in the card.
     * This information can be anything, and the card can access it at any point.
     * 
     * I do not recommend changing this in any other context than in a card's blueprint, unless you know what you are doing.
     */
    storage: { [key: string]: any } = {};

    /**
     * The turn that the card was played / created.
     */
    turn: number;

    /**
     * The card's enchantments.
     * Formatted like this:
     * 
     * ```json
     * [
     *     {
     *         "enchantment": "-1 cost",
     *         "owner": // some_card
     *     }
     * ]
     * ```
     */
    enchantments: EnchantmentDefinition[] = [];

    /**
     * This overrides `game.config` for the card's owner while importing the card in a deck.
     * 
     * # Examples
     * ```ts
     * card.deckSettings = {
     *     deck: {
     *         maxDeckLength: 40,
     *         minDeckLength: 40
     *     }
     * };
     * ```
     */
    deckSettings?: GameConfig;

    /**
     * The owner of the card.
     */
    plr: Player;

    /**
     * A list of backups of this card.
     * 
     * The card backups don't include the methods so don't call any.
     */
    backups: {[key: string | number]: CardBackup} = {};

    /**
     * The card's uuid. Gets randomly generated when the card gets created.
     */
    uuid: string;

    // Could be null

    /**
     * The turn that the card was killed.
     * 
     * Set to -1 if the card is not dead.
     */
    turnKilled?: number;

    /**
     * The amount of infuse a card has.
     */
    infuse?: number;
    
    /**
     * The turn that the card was frozen.
     * 
     * Set to -1 if the card is not frozen.
     */
    turnFrozen?: number; // TODO: Rename this

    /**
     * The runes of the card.
     */
    runes?: string;

    /**
     * The amount of turns stealth should last.
     * 
     * Set to 0 if the card is does not have a stealth duration.
     */
    stealthDuration?: number = 0;

    /**
     * If the card can attack the hero.
     * 
     * This will be set to true if the card is a spell and other card types, so verify the type of the card before using this.
     */
    canAttackHero?: boolean = true;

    /**
     * Placeholder key-value pairs.
     * 
     * This should not be used directly, unless you know what you are doing.
     * 
     * @example
     * this.placeholder = {
     *     "turn": game.turns,
     * }
     * 
     * assert.equal(this.desc, "The current turn is: {turn}");
     * // Eventually...
     * assert.equal(this.desc, "The current turn is: 1");
     */
    placeholder?: {[key: string]: any} = {};

    /**
     * The _name_ of the corrupted counterpart of this card.
     */
    corrupt?: string;

    /**
     * ["Name of the card above the minion", "", "Name of the card below the minion"]
     * 
     * The "" gets replaced by this minion.
     * This is flexible, you can add as many as you want, in any order. You can even add another "".
     * 
     * @example
     * card = new Card("Sheep", plr);
     * card.colossal = ["Left Arm", "", "Right Arm"];
     * 
     * // Left Arm
     * // Sheep
     * // Right Arm
     */
    colossal?: string[];

    /**
     * A list of abilities that can only be used if the `condition` ability returns true.
     */
    conditioned?: CardAbility[];
    
    /**
     * The abilities of the card (battlecry, deathrattle, etc...)
     */
    abilities: {[key in CardAbility]?: Ability[]} = {};
    

    /**
     * Create a card.
     * 
     * @param name The name of the card
     * @param plr The card's owner.
     */
    constructor(name: string, plr: Player) {
        game = globalThis.game;

        // Get the blueprint from the cards list
        let blueprint = game.cards.find(c => c.name == name);
        if (!blueprint) {
            throw new Error(`Could not find card with name ${name}`);
        }

        // Set the blueprint (every thing that gets set before the `doBlueprint` call can be overriden by the blueprint)
        this.blueprint = blueprint;
        this.name = name;

        // The display name is equal to the unique name, unless manually overriden by the blueprint when calling the `doBlueprint` function.
        this.displayName = name;

        // The turn the card was played
        this.turn = game.turns; 

        // Set maxHealth if the card is a minion or weapon
        this.type = this.blueprint.type; // Redundant, makes the TypeScript compiler shut up
        this.maxHealth = this.blueprint.stats?.at(1);

        // Override the properties from the blueprint
        this.doBlueprint();

        // Properties after this point can't be overriden
        this.plr = plr;

        // Make a backup of "this" to be used when silencing this card
        // TODO: Make the backups work without causing errors
        // @ts-expect-error
        if (!this.backups.init) this.backups.init = {};
        Object.entries(this).forEach(i => {
            // @ts-expect-error
            this.backups.init[i[0]] = i[1];
        });

        this.randomizeUUID();

        let placeholder = this.activate("placeholders");
        if (placeholder instanceof Array) this.placeholder = placeholder[0]; // This is a list of replacements.

        game.events.broadcast("CreateCard", this, this.plr);
        this.activate("create");
    }

    /**
     * Randomizes the uuid for this card to prevent cards from being "linked"
     */
    randomizeUUID() {
        this.uuid = uuidv4();
    }

    /**
     * Sets fields based on the blueprint of the card.
     */
    doBlueprint(): void {
        // Reset the blueprint
        this.blueprint = game.cards.find(c => c.name == this.name) || this.blueprint;

        /*
        Go through all blueprint variables and
        set them in the card object
        Example:
        Blueprint: { name: "Sheep", stats: [1, 1], test: true }
                                                   ^^^^^^^^^^
        Do: this.test = true
        
        Function Example:
        Blueprint: { name: "The Coin", cost: 0, cast(plr, game, self): { plr.refreshMana(1, plr.maxMaxMana) } }
                                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        Do: this.abilities.cast = [{ plr.gainMana(1) }]
                                  ^                   ^
                                  This is in an array so we can add multiple events on casts
        */
        Object.entries(this.blueprint).forEach(i => {
            let [key, val] = i;

            if (typeof val == "function") this.abilities[key as CardAbility] = [val];
            // @ts-expect-error
            else this[key] = JSON.parse(JSON.stringify(i[1]));
        });

        // Set maxHealth if the card is a minion or weapon
        this.maxHealth = this.blueprint.stats?.at(1);

        this.desc = game.functions.parseTags(this.desc || "");
    }

    /**
     * Adds a deathrattle to the card
     * 
     * @param _deathrattle The deathrattle to add
     * 
     * @returns Success
     */
    addDeathrattle(_deathrattle: Ability): boolean {
        if (!this.abilities.deathrattle) this.abilities.deathrattle = [];

        this.abilities.deathrattle.push(_deathrattle);

        // Just in case we want this function to ever fail, we make it return success.
        return true;
    }

    // Keywords

    /**
     * Adds a keyword to the card
     * 
     * @param keyword The keyword to add
     * 
     * @returns Success
     */
    addKeyword(keyword: CardKeyword): boolean {
        if (this.keywords.includes(keyword)) return false;

        this.keywords.push(keyword);

        if (keyword === "Charge") this.sleepy = false;
        else if (keyword === "Rush") {
            this.sleepy = false;
            this.canAttackHero = false;
        }

        return true;
    }

    /**
     * @deprecated Use `game.functions.remove(card.keywords, "Taunt")`
     * 
     * Removes a keyword from the card
     * 
     * @param keyword The keyword to remove
     * 
     * @returns Success
     */
    removeKeyword(keyword: CardKeyword): boolean {
        this.keywords = this.keywords.filter(k => k != keyword);

        return true;
    }

    /**
     * Freeze the card
     *
     * @returns Success
     */
    freeze(): boolean {
        this.turnFrozen = game.turns;
        this.frozen = true;

        game.events.broadcast("FreezeCard", this, this.plr);

        return true;
    }

    /**
     * Mark a card as having attacked once, and if it runs out of attacks this turn, exhaust it.
     *
     * @returns Success
     */
    decAttack(): boolean {
        if (!this.attackTimes) return false;
        this.attackTimes--;

        const shouldExhaust = (this.attackTimes <= 0);
        if (shouldExhaust) this.sleepy = true;

        return true;
    }
    
    /**
     * Makes this minion ready for attack
     * 
     * @returns Success
     */
    ready(): boolean {
        this.sleepy = false;
        this.resetAttackTimes();

        return true;
    }

    // Change stats

    /**
     * Returns the card's attack
     * 
     * Returns -1 if the card does not have attack
     */
    getAttack(): number {
        return this.stats?.at(0) ?? 1001;
    }

    /**
     * Returns the card's health
     * 
     * Returns -1 if the card does not have health
     */
    getHealth(): number {
        return this.stats?.at(1) ?? 1001;
    }

    /**
     * Sets the card's attack and health.
     * 
     * @param attack The attack to set
     * @param health The health to set
     * @param changeMaxHealth If the card's max health should be reset to it's current health if the health increases from running this function.
     * 
     * @returns Success
     */
    setStats(attack?: number, health?: number, changeMaxHealth: boolean = true): boolean {
        if (attack == undefined) attack = this.getAttack();
        if (health == undefined) health = this.getHealth();

        this.stats = [attack, health];

        if (changeMaxHealth && health > (this.maxHealth ?? -1)) {
            this.maxHealth = health;
        }

        return true;
    }

    /**
     * Adds `attack` and `health` to the card.
     * 
     * @param attack The attack to add
     * @param health The health to add
     * 
     * @returns Success
     */
    addStats(attack: number = 0, health: number = 0): boolean {
        this.addAttack(attack);
        this.addHealth(health, false);

        return true;
    }

    /**
     * Removes `attack` and `health` from the card.
     * 
     * @param attack The attack to remove
     * @param health The health to remove
     * 
     * @returns Success
     */
    remStats(attack: number = 0, health: number = 0): boolean {
        this.remAttack(attack);
        this.remHealth(health);

        return true;
    }

    /**
     * Adds `amount` to the card's health
     * 
     * @param amount The health to add
     * @param restore Should reset health to it's max health if it goes over it's max health
     * 
     * @returns Success
     */
    addHealth(amount: number, restore: boolean = true): boolean {
        if (!this.stats) return false;

        let before = this.getHealth();
        this.setStats(this.getAttack(), this.getHealth() + amount, !restore);
    
        if (!restore) {
            this.resetMaxHealth(true);
            return true;
        }

        // Restore health

        if (this.maxHealth && this.getHealth() > this.maxHealth) {
            // Too much health
            this.activate("overheal"); // Overheal keyword

            if (this.getHealth() > before) game.events.broadcast("HealthRestored", this.maxHealth, this.plr);

            this.stats[1] = this.maxHealth ?? -1;
        } else if (this.getHealth() > before) {
            game.events.broadcast("HealthRestored", this.getHealth(), this.plr);
        }

        return true;
    }

    /**
     * Adds `amount` to the card's attack
     * 
     * @param amount The attack to add
     * 
     * @returns Success
     */
    addAttack(amount: number): boolean {
        this.setStats(this.getAttack() + amount, this.getHealth());

        return true;
    }

    /**
     * Damages a card.
     * 
     * Doesn't damage the card if it is a location card, is immune, or has Stealth.
     * 
     * @param amount The health to remove
     * 
     * @returns Success
     */
    remHealth(amount: number): boolean {
        if (this.type == "Location") return false; // Don't allow location cards to be damaged
        if (this.keywords.includes("Stealth")) return false;

        if (this.immune) return true;

        this.setStats(this.getAttack(), this.getHealth() - amount);
        game.events.broadcast("DamageMinion", [this, amount], this.plr);

        if (this.type == "Weapon" && this.getHealth() <= 0) {
            this.plr.destroyWeapon(true);
        }

        return true;
    }

    /**
     * Removes `amount` from the card's attack
     * 
     * @param amount The attack to remove
     * 
     * @returns Success
     */
    remAttack(amount: number): boolean {
        this.setStats(this.getAttack() - amount, this.getHealth());

        return true;
    }

    /**
     * Sets the max health of the card to it's current health. If check is true it only sets the max health if the current health is above it.
     * 
     * @param check Prevent lowering it's max health
     * 
     * @returns If it reset the card's max health.
     */
    resetMaxHealth(check: boolean = false): boolean {
        if (!this.maxHealth) return false;

        if (check && this.getHealth() <= this.maxHealth) return false;

        this.maxHealth = this.getHealth();
        return true;
    }

    // Set other

    /**
     * Sets stealth to only last `duration` amount of turns
     * 
     * @param duration The amount of turns stealth should last
     * 
     * @returns Success.
     */
    setStealthDuration(duration: number): boolean {
        this.stealthDuration = game.turns + duration;

        return true;
    }

    /**
     * Sets the attack times of a card to;
     * 1 if doesn't have windfury,
     * 2 if it does,
     * 4 if it has mega-windfury.
     * 
     * @returns Success
     */
    resetAttackTimes(): boolean {
        this.attackTimes = 1;

        if (this.keywords.includes("Windfury")) {
            this.attackTimes = 2;
        }
        if (this.keywords.includes("Mega-Windfury")) {
            this.attackTimes = 4;
        }

        return true;
    }

    /**
     * Create a backup of the card.
     *
     * @returns The key of the backup. You can use it by doing `card.backups[key]`
     */
    createBackup(): number {
        let key = Object.keys(this.backups).length;

        Object.entries(this).forEach(i => {
            // @ts-expect-error
            this.backups[key][i[0]] = i[1];
        });
        
        return key;
    }

    /**
     * Restore a backup of the card.
     *
     * @param backup The backup to restore. It is recommended to supply a backup from `card.backups`.
     *
     * @returns Success
     */
    restoreBackup(backup: CardBackup): boolean {
        Object.keys(backup).forEach(att => {
            // @ts-expect-error
            this[att] = backup[att];
        });

        return true;
    }

    /**
     * Bounces the card to the `plr`'s hand.
     * 
     * @param plr 
     */
    bounce(plr?: Player): boolean {
        if (!plr) plr = this.plr;

        plr.addToHand(this.perfectCopy());
        this.destroy();
        return true;
    }

    // Doom buttons

    /**
     * Kills the card.
     *
     * @returns Success
     */
    kill(): boolean {
        this.setStats(this.getAttack(), 0);
        game.killMinions();

        return true;
    }

    /**
     * Silences the card.
     * 
     * @returns Success
     */
    silence(): boolean {
        // Tell the minion to undo it's passive.
        // The false tells the minion that this is the last time it will call remove
        // so it should finish whatever it is doing.
        this.activate("remove");

        Object.keys(this).forEach(att => {
            // Check if a backup exists for the attribute. If it does; restore it.
            // @ts-expect-error
            if (this.backups.init[att]) this[att] = this.backups.init[att];

            // Check if the attribute if defined in the blueprint. If it is; restore it.
            // @ts-expect-error
            else if (this.blueprint[att]) this[att] = this.blueprint[att];
        });
        this.desc = "";
        this.keywords = [];

        this.applyEnchantments(); // Remove active enchantments.
        return true;
    }

    /**
     * Silences, then kills the card.
     * 
     * @returns Success
     */
    destroy(): boolean {
        this.silence();
        this.kill();

        return true;
    }

    // Handling functions

    /**
     * Activates an ability
     * 
     * @param name The method to activate
     * @param args Pass these args to the method
     * 
     * @returns All the return values of the method keywords
     */
    activate(name: CardAbility, ...args: any): any[] | -1 | false {
        // This activates a function
        // Example: activate("cast")
        // Do: this.cast.forEach(cast_func => cast_func(plr, game, card))
        // Returns a list of the return values from all the function calls
        let ability: Ability[] | undefined = this.abilities[name];

        // If the card has the function
        if (!ability) return false;

        let ret: any[] | -1 = [];
        
        ability.forEach(func => {
            if (ret === game.constants.REFUND) return;

            // Check if the method is conditioned
            if (this.conditioned && this.conditioned.includes(name)) {
                let r = this.activate("condition");
                if (!(r instanceof Array) || r[0] === false) return;
            }

            let r = func(this.plr, game, this, ...args);
            if (ret instanceof Array) ret.push(r);

            if (r != game.constants.REFUND || name == "deathrattle") return; // Deathrattle isn't cancellable

            // If the return value is -1, meaning "refund", refund the card and stop the for loop
            game.events.broadcast("CancelCard", [this, name], this.plr);

            ret = game.constants.REFUND;

            // These abilities shouldn't "refund" the card, just stop execution.
            if (["use", "heropower"].includes(name)) return;

            let unsuppress = game.functions.suppressEvent("AddCardToHand");
            this.plr.addToHand(this);
            unsuppress();

            this.plr[this.costType] += this.cost;

            // Return from the for loop
            return;
        });

        return ret;
    }

    /**
     * Activates a card's battlecry
     * 
     * @param args Any arguments to pass to battlecry.
     * 
     * @returns The return values of all the battlecries triggered
     */
    activateBattlecry(...args: any): any[] | -1 | false {
        // Trigger the card's passive first, so cards that get played immediately gets their passive triggered before their battlecry
        this.activate("passive", "battlecry", this, game.turns);

        // Trigger the battlecry
        return this.activate("battlecry", ...args);
    }
    /**
     * Returns `m` is more than or equal to the player's max mana
     * 
     * @param m The mana to test
     */
    manathirst(m: number): boolean {
        return this.plr.maxMana >= m;
    }

    /**
     * Checks if the condition is met, and if it is, adds `(Condition cleared!)` to the description
     * 
     * @returns If the condition is met
     */
    condition(): boolean {
        const cleared_text = " <bright:green>(Condition cleared!)</bright:green>";
        const cleared_text_alt = "<bright:green>Condition cleared!</bright:green>";

        // Remove the (Condition cleared!) from the description
        this.desc = this.desc?.replace(cleared_text, "");
        this.desc = this.desc?.replace(cleared_text_alt, "");

        // Check if the condition is met
        let condition = this.activate("condition");
        if (!(condition instanceof Array) || condition[0] === false) return false;

        // Add the (Condition cleared!) to the description
        if (this.desc) this.desc += cleared_text;
        else this.desc += cleared_text_alt;

        return true;
    }

    /**
     * Get information from an enchantment.
     *
     * @param e The enchantment string
     * 
     * @example
     * let info = getEnchantmentInfo("cost = 1");
     * assert.equal(info, {"key": "cost", "val": "1", "op": "="});
     *
     * @returns The info
     */
    getEnchantmentInfo(e: string): { key: string; val: string; op: string; } {
        let equalsRegex = /\w+ = \w+/;
        let otherRegex = /[-+*/^]\d+ \w+/;

        let opEquals = equalsRegex.test(e);
        let opOther = otherRegex.test(e);

        let key = "undefined";
        let val = "undefined";
        let op = "=";

        if (opEquals) [key, val] = e.split(" = ");
        else if (opOther) {
            [val, key] = e.split(" ");
            val = val.slice(1);

            op = e[0];
        }

        return {"key": key, "val": val, "op": op};
    }

    /**
     * Runs through this card's enchantments list and applies each enchantment in order.
     *
     * @returns Success
     */
    applyEnchantments(): boolean {
        // Apply baseline for int values.
        const whitelisted_vars = ["maxHealth", "cost"];

        let vars = Object.entries(this);
        vars = vars.filter(c => typeof(c[1]) == "number"); // Filter for only numbers
        vars = vars.filter(c => whitelisted_vars.includes(c[0])); // Filter for vars in the whitelist

        // Get keys
        let keys: string[] = [];

        let enchantments = this.enchantments.map(e => e.enchantment); // Get a list of enchantments
        enchantments.forEach(e => {
            let info = this.getEnchantmentInfo(e);
            let key = info.key;
            
            keys.push(key);
        });

        vars = vars.filter(c => keys.includes(c[0])); // Only reset the variables if the variable name is in the enchantments list
        vars.forEach(ent => {
            let [key, val] = ent;

            // Apply backup if it exists, otherwise keep it the same.
            if (this.backups.init?[key] : false) {
                // @ts-expect-error
                this[key] = this.backups.init[key];
            }
        });

        this.enchantments.forEach(e => {
            let enchantment = e.enchantment;

            // Seperate the keys and values
            let info = this.getEnchantmentInfo(enchantment);
            let [key, val, op] = Object.values(info);
            
            let numberVal = parseInt(val);

            switch (op) {
                case '=':
                    // @ts-expect-error
                    this[key] = numberVal;
                    break;
                case '+':
                    // @ts-expect-error
                    this[key] += numberVal;
                    break;
                case '-':
                    // @ts-expect-error
                    this[key] -= numberVal;
                    break;
                case '*':
                    // @ts-expect-error
                    this[key] *= numberVal;
                    break;
                case '/':
                    // @ts-expect-error
                    this[key] /= numberVal;
                    break;
                case '^':
                    // @ts-expect-error
                    this[key] = Math.pow(this[key], numberVal);
                    break;
                default:
                    break;
            }
        });

        return true;
    }

    /**
     * Add an enchantment to the card. The enchantments look something like this: `cost = 1`, `+1 cost`, `-1 cost`.
     *
     * @param e The enchantment string
     * @param card The creator of the enchantment. This will allow removing or looking up enchantment later.
     *
     * @returns Success
     */
    addEnchantment(e: string, card: Card): boolean {
        let info = this.getEnchantmentInfo(e);

        if (info.op == "=") this.enchantments.unshift({"enchantment": e, "owner": card}); // Add the enchantment to the beginning of the list, equal enchantments should apply first
        else this.enchantments.push({"enchantment": e, "owner": card});

        this.applyEnchantments();

        return true;
    }

    /**
     * Checks if an enchantment exists.
     *
     * @param e The enchantment to look for.
     * @param card The owner of the enchantment. This needs to be correct to find the right enchantment.
     * @see {@link addEnchantment} for more info about `card`.
     * 
     * @returns If the enchantment exists
     */
    enchantmentExists(e: string, card: Card): boolean {
        return this.enchantments.some(c => c.enchantment == e && c.owner == card);
    }

    /**
     * Removes an enchantment
     *
     * @param e The enchantment to remove
     * @param card The owner of the enchantment.
     * @see {@link enchantmentExists} for more info about `card`.
     * @param update Keep this enabled unless you know what you're doing.
     *
     * @returns Success
     */
    removeEnchantment(e: string, card: Card, update: boolean = true): boolean {
        let enchantment = this.enchantments.find(c => c.enchantment == e && c.owner == card);
        if (!enchantment) return false;

        let index = this.enchantments.indexOf(enchantment);
        if (index === -1) return false;

        this.enchantments.splice(index, 1);

        if (!update) {
            this.applyEnchantments();
            return true;
        }

        // Update is enabled
        let info = this.getEnchantmentInfo(e);
        let new_enchantment = `+0 ${info.key}`;

        this.addEnchantment(new_enchantment, this); // This will cause the variable to be reset since it is in the enchantments list.
        this.removeEnchantment(new_enchantment, this, false);

        return true;
    }

    /**
     * Replaces the placeholders (`{0}`) with their values
     * 
     * @example
     * card.desc = "The current turn count is {0}";
     * card.placeholders = [(plr, game, self) => {
     *     let turns = Math.ceil(game.turns / 2);
     * 
     *     return {0: turns};
     * }];
     * card.replacePlaceholders();
     * 
     * // The `{ph:0}` tags are removed when displaying cards.
     * assert.equal(card.desc, "The current turn count is {ph:0} 1 {/ph}");
     * 
     * @returns Success
     */
    replacePlaceholders(): boolean {
        if (!this.abilities.placeholders) return false;

        let tempPlaceholder = this.activate("placeholders");
        if (!(tempPlaceholder instanceof Array)) return false; // Maybe throw an error?

        let placeholder = tempPlaceholder[0];
        if (!(placeholder instanceof Object)) return false;

        this.placeholder = placeholder;

        Object.entries(placeholder).forEach(p => {
            let [key, _] = p;
            let replacement = `{ph:${key}} placeholder {/ph}`;

            this.desc = this.desc?.replace(new RegExp(`{ph:${key}} .*? {/ph}`, 'g'), replacement);
            this.desc = this.desc?.replaceAll(`{${key}}`, replacement);
        });

        return true;
    }

    /**
     * Return a perfect copy of this card. This will perfectly clone the card. This happens when, for example, a card gets temporarily removed from the board using card.destroy, then put back on the board.
     * 
     * @example
     * let cloned = card.perfectCopy();
     * let cloned2 = game.functions.cloneCard(card);
     * 
     * // This will actually fail since they're slightly different, but you get the point
     * assert.equal(cloned, cloned2);
     * 
     * @returns A perfect copy of this card.
     */
    perfectCopy(): Card {
        return game.functions.cloneCard(this);
    }

    /**
     * Return an imperfect copy of this card. This happens when, for example, a card gets shuffled into your deck in vanilla Hearthstone.
     * 
     * @example
     * let cloned = card.imperfectCopy();
     * let cloned2 = new Card(card.name, card.plr);
     * 
     * // This will actually fail since they're slightly different, but you get the point
     * assert.equal(cloned, cloned2);
     * 
     * @returns An imperfect copy of this card.
     */
    imperfectCopy(): Card {
        return new Card(this.name, this.plr);
    }
}
