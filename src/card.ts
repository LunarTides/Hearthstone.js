import type { Player } from "@Game/player.ts";
import {
	Ability,
	type AbilityCallback,
	type Blueprint,
	type CardBackup,
	Class,
	CostType,
	DeckValidationError,
	type EnchantmentDefinition,
	type EnchantmentPriority,
	Event,
	type GameAttackFlags,
	type GameConfig,
	Keyword,
	Location,
	Rarity,
	RemoveReason,
	type Rune,
	type SpellSchool,
	type Tag,
	type Target,
	type Tribe,
	Type,
} from "@Game/types.ts";
import { randomUUID } from "node:crypto";
import { parseTags } from "chalk-tags";

/**
 * Use this error type when throwing an error in a card
 */
export class CardError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, CardError.prototype);
		this.name = "CardError";
	}
}

export class Card {
	// All

	/**
	 * The name of the card.
	 *
	 * Please do not change this in code.
	 */
	name: string;

	/**
	 * The card's description / text.
	 *
	 * Might include color tags like `Example <red>Example 2</red>`.
	 * Use `game.functions.color.stripAll` to remove these.
	 */
	text: string;

	/**
	 * The cost of the card.
	 */
	cost = 0;

	/**
	 * This is the class that the card belongs to. E.g. "Warlock" or "Mage".
	 */
	classes = [Class.Neutral];

	/**
	 * This is the type of card, e.g. "Spell" or "Minion".
	 */
	type = Type.Undefined;

	/**
	 * This is the rarity of the card. E.g. Common, Rare, etc...
	 */
	rarity = Rarity.Free;

	/**
	 * The id tied to the blueprint of the card.
	 * This differentiates cards from each other, but not cards with the same blueprint, use {@link uuid} for that.
	 *
	 * @example
	 * const sheep = game.createCard(game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c, player);
	 * const anotherSheep = game.createCard(game.cardIds.sheep_668b9054_7ca9_49af_9dd9_4f0126c6894c, player);
	 *
	 * const theCoin = game.createCard(game.cardIds.theCoin_e4d1c19c_755a_420b_b1ec_fc949518a25f, player);
	 *
	 * assert.equal(sheep.id, anotherSheep.id);
	 * assert.notEqual(sheep.id, theCoin.id);
	 */
	id = "";

	/**
	 * If the card is collectible.
	 * - Uncollectible cards cannot be added to decks, and cannot be found in card pools unless explicitly stated otherwise.
	 * - Uncollectible cards can mostly only be explicitly created by other collectible cards.
	 */
	collectible = false;

	/**
	 * The keywords that the card has. E.g. "Taunt", "Divine Shield", etc...
	 *
	 * There is also some arbitrary information stored alongside the keywords in this object, which can be added by the user in a user-friendly way, or be used for internal purposes.
	 *
	 * E.g. The `Corrupt` keyword stores the id of the corrupted card, supplied by the user in the `create` ability.
	 * E.g. The `Forgetful` keyword stores its state, which is an internal number only used in the attack code.
	 */
	keywords: { [key in Keyword]?: unknown } = {};

	/**
	 * Any tags that should be applied to the card.
	 * Tags are used to group cards together.
	 * E.g. Tag.Lackey
	 *
	 * This can be queried like this: `Card.allWithTags(Tag.Lackey);`
	 */
	tags: Tag[] = [];

	/**
	 * The card's blueprint. This is the baseline of the card.
	 */
	blueprint: Blueprint;

	// Minion / Weapon

	attack?: number;
	health?: number;

	/**
	 * The tribes the card belongs to.
	 */
	tribes?: Tribe[];

	/**
	 * The number of times a minion can attack in a turn;
	 * - Default: 1
	 * - With Windfury: 2
	 * - With Mega-Windfury: 4
	 *
	 * This decreases every time the minion attacks, and is reset at the end of the player's turn.
	 *
	 * If this is 0, the card is exhausted and so can't attack. Use {@link exhaust} instead of setting this to 0.
	 */
	attackTimes: number = 0;

	/**
	 * The maximum health of the card.
	 */
	maxHealth?: number;

	// Spell

	/**
	 * If the card is a spell, this is the schools of the spell. E.g. "Fire", "Frost", or "Fel".
	 */
	spellSchools?: SpellSchool[];

	// Hero

	/**
	 * The amount of armor the hero card gives when played.
	 */
	armor?: number;

	/**
	 * The id of the hero power card associated with this hero card.
	 */
	heropowerId?: string;

	/**
	 * The hero power card associated with this hero card.
	 */
	heropower?: Card;

	// Location

	/**
	 * The durability of the location card.
	 */
	durability?: number;

	/**
	 * The cooldown of the location card.
	 */
	cooldown = 2;

	// Enchantment

	/**
	 * The priority of the enchantment.
	 *
	 * A higher priority means that the enchantment will be applied before others. The order of the enchantments can affect the resulting card.
	 *
	 * For example, an enchantment setting a card's attack to 0 should be applied before ones that increase the cards attack.
	 * Otherwise, if the card has a +1 Attack and a Attack = 0 enchantment, the order of events can look like this: 3 -> 4 -> 0, which is not the intended effect. Instead it should look like: 3 -> 0 -> 1
	 */
	enchantmentPriority?: EnchantmentPriority;

	// Not-null

	/**
	 * What currency this card costs.
	 * If this is "mana", the card costs `Player.mana`.
	 * If this is "armor", the card costs `Player.armor`.
	 * If this is "health", the card costs `Player.health`.
	 * etc...
	 *
	 * This can be any value, as long as it is a defined _number_ in the `Player` class (although the typescript compiler would complain if you don't update the `CostType` type).
	 */
	costType = CostType.Mana;

	/**
	 * Information stored in the card.
	 * This information can be anything, and the card can access it at any point. Use {@link getStorage} and {@link setStorage} to manage this.
	 *
	 * Access it like this:
	 * ```
	 * // The "host" is the card who should store the information. The "manager" is the card who manages the information.
	 * host.storage[manager.uuid].someProperty = "some value";
	 *
	 * // Most times, the host and manager are the same.
	 * self.storage[self.uuid].somePersistantState = 3;
	 *
	 * // But sometimes, they're not.
	 * target.storage[self.uuid].affected = true;
	 *
	 * // Later...
	 * for (const card of game.activeCards) {
	 *     if (card.storage[self.uuid]?.affected) {
	 *         card.addStats(1, 1);
	 *     }
	 * }
	 * ```
	 *
	 * Be careful changing a card's storage that's managed by another card. You might break it.
	 *
	 * See also `game.cache` for global storage (no clear managers).
	 */
	storage: Record<string, Record<string, any>> = {};

	/**
	 * The turn that the card was created.
	 */
	turnCreated: number;

	/**
	 * The turn that the card was played.
	 */
	turnPlayed: number;

	/**
	 * The turn that the card was killed.
	 */
	turnKilled: number;

	/**
	 * The card's active enchantments.
	 */
	activeEnchantments: EnchantmentDefinition[] = [];

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
	 * The owner of this card.
	 */
	owner: Player;

	/**
	 * A list of backups of this card.
	 *
	 * The card backups don't include the methods so don't call any.
	 */
	backups: Record<string | number, CardBackup> = {};

	/**
	 * The card's uuid. Gets randomly generated when the card gets created.
	 */
	uuid: string;

	/**
	 * Where the card currently is.
	 */
	location: Location = Location.None;

	/**
	 * The runes of the card.
	 */
	runes?: Rune[];

	/**
	 * The amount of spell damage the card has.
	 */
	spellDamage?: number;

	/**
	 * The amount of turns stealth should last.
	 *
	 * Set to 0 if the card is does not have a stealth duration.
	 */
	stealthDuration?: number = 0;

	/**
	 * If the card can attack the hero this turn.
	 *
	 * This will be set to true if the card is a spell and other card types, so verify the type of the card before using this.
	 */
	canAttackHero?: boolean = true;

	/**
	 * The abilities of the card (battlecry, deathrattle, etc...)
	 */
	abilities: { [key in Ability]?: AbilityCallback[] } = {};

	/**
	 * **USE `Card.create` INSTEAD.**
	 *
	 * @param id The id of the blueprint.
	 * @param owner The player that should own this card.
	 */
	constructor(id: string, owner: Player) {
		// Get the blueprint from the cards list
		const blueprint = game.blueprints.find((c) => c.id === id);
		if (!blueprint) {
			throw new Error(`Could not find card with id "${id}"`);
		}

		// Set the blueprint (every thing that gets set before the `doBlueprint` call can be overriden by the blueprint)
		this.blueprint = blueprint;
		this.name = blueprint.name;

		// The turn the card was played
		this.turnCreated = game.turn;

		// Redundant, makes the TypeScript compiler shut up
		this.type = this.blueprint.type;

		// Set maxHealth if the card is a minion or weapon
		this.maxHealth = this.blueprint.health;
		this.owner = owner;

		this.randomizeUUID();

		game.activeCards.push(this);
	}

	static REFUND: -1 = -1;

	/**
	 * Returns all cards with the name `name`. USE `imperfectCopy` OR `perfectCopy` ON THE CARDS.
	 *
	 * @param refer If this should call `getCardById` if it doesn't find the card from the name
	 *
	 * @example
	 * const cards = await Card.allFromName('The Coin');
	 *
	 * assert.ok(card[0] instanceof Card);
	 * assert.equal(card[0].name, 'The Coin');
	 */
	static async allFromName(name: string, refer = true): Promise<Card[]> {
		// First, check if `name` is actually an id instead of a name.
		const id = await Card.fromID(name);

		/*
		 * For some reason, "10 Mana" turns into 10 when passed through `parseInt`.
		 * So we check if it has a space
		 */
		if (id && refer && !name.includes(" ")) {
			return [id];
		}

		return (await Card.all(true)).filter(
			(c) => c.name.toLowerCase() === name.toLowerCase(),
		);
	}

	/**
	 * Creates a card with the specified id.
	 *
	 * @param id The id of the card to create.
	 * @param player The player that should own the card.
	 * @param [suppressEvent=false] If the `CreateCard` event should be suppressed.
	 */
	static async create(
		id: string,
		player: Player,
		suppressEvent = false,
	): Promise<Card> {
		const card = new Card(id, player);
		await card.setup(suppressEvent);

		return card;
	}

	/**
	 * Creates a card with the given name for the specified player. If there are multiple cards with the same name, this will use the first occurrence.
	 *
	 * @returns The created card, or undefined if no card is found.
	 */
	static async fromName(
		name: string,
		player: Player,
	): Promise<Card | undefined> {
		const cards = await Card.allFromName(name);
		if (cards.length <= 0) {
			return undefined;
		}

		return Card.create(cards[0].id, player, true);
	}

	/**
	 * Returns the card with the id of `id`.
	 *
	 * @example
	 * const card = await Card.fromID(2);
	 *
	 * assert.ok(card instanceof Card);
	 * assert.equal(card.name, 'The Coin');
	 */
	static async fromID(id: string): Promise<Card | undefined> {
		return (await Card.all(true)).find((c) => c.id === id);
	}

	/**
	 * Returns all cards added to Hearthstone.js from the "cards" folder.
	 *
	 * @param include_uncollectible If it should include all uncollectible cards
	 */
	static async all(include_uncollectible = false): Promise<Card[]> {
		// Don't broadcast CreateCard event here since it would spam the history and log files
		if (game.cards.length <= 0) {
			game.cards = await Promise.all(
				game.blueprints.map(async (card) =>
					Card.create(card.id, game.player, true),
				),
			);

			await game.functions.card.generateIdsFile();
		}

		return game.cards.filter((c) => c.collectible || include_uncollectible);
	}

	/**
	 * Returns all cards that have all the matching tags.
	 *
	 * @param tags The tags to filter the cards by.
	 * @returns An array of cards that have all of the specified tags.
	 */
	static async allWithTags(...tags: Tag[]): Promise<Card[]> {
		return (await Card.all(true)).filter((c) =>
			tags.every((tag) => c.tags.includes(tag)),
		);
	}

	/**
	 * Returns the card with the given UUID wherever it is.
	 *
	 * @param uuid The UUID to search for. This matches if the card's UUID starts with the given UUID (this).
	 * @returns The card that matches the UUID, or undefined if no match is found.
	 */
	static fromUUID(uuid: string): Card | undefined {
		return game.activeCards.find((card) => card.uuid.startsWith(uuid));
	}

	/**
	 * Imports and registers all cards from the "cards" folder
	 *
	 * @returns Success
	 */
	static async registerAll(): Promise<boolean> {
		await game.functions.util.searchCardsFolder(async (fullPath) => {
			const blueprint = (await import(fullPath)).blueprint as Blueprint;
			game.blueprints.push(blueprint);
		});

		// Remove falsy values
		game.blueprints = game.blueprints.filter(Boolean);

		if (!game.functions.card.runBlueprintValidator()) {
			throw new Error(
				"Some cards are invalid. Please fix these issues before playing.",
			);
		}

		return true;
	}

	/**
	 * Reloads all cards
	 *
	 * @returns Success
	 */
	static async reloadAll(): Promise<boolean> {
		game.blueprints = [];

		for (const key of Object.keys(require.cache)) {
			if (key.includes("/cards/") || key.includes("\\cards\\")) {
				delete require.cache[key];
			}
		}

		return await Card.registerAll();
	}

	/**
	 * Does some stuff that can't be done in the constructer since it is async.
	 *
	 * Don't call manually.
	 *
	 * @param [suppressEvent=false] If the "CreateCard" event should be suppressed.
	 */
	async setup(suppressEvent = false): Promise<void> {
		// Override the properties from the blueprint
		await this.doBlueprint(false);
		await this.trigger(Ability.Create);

		if (suppressEvent) {
			await game.event.withSuppressed(Event.CreateCard, async () => {
				await game.event.broadcast(Event.CreateCard, this, this.owner);
			});
		} else {
			await game.event.broadcast(Event.CreateCard, this, this.owner);
		}

		/*
		 * Properties after this point can't be overriden
		 * Make a backup of "this" to be used when silencing this card
		 */
		if (!this.backups.init) {
			this.backups.init = {} as CardBackup;
		}

		for (const entry of Object.entries(this)) {
			// HACK: Never usage
			this.backups.init[entry[0] as never] = entry[1] as never;
		}
	}

	/**
	 * Randomizes the uuid for this card to prevent cards from being "linked"
	 */
	randomizeUUID(): void {
		this.uuid = randomUUID();
	}

	/**
	 * Sets fields based on the blueprint of the card.
	 *
	 * @param [trigger=true] If it should trigger the card's `create` ability.
	 * @param [forceUsingOwnBlueprint=false] If it should force using the `card.blueprint` object instead of relying on `game.blueprints`.
	 */
	async doBlueprint(
		trigger = true,
		forceUsingOwnBlueprint = false,
	): Promise<void> {
		// Reset the blueprint
		if (!forceUsingOwnBlueprint) {
			this.blueprint =
				game.blueprints.find((c) => c.id === this.id) ?? this.blueprint;
		}

		/*
		 * Go through all blueprint variables and
		 * set them in the card object
		 * Example:
		 * Blueprint: { name: "Sheep", stats: [1, 1], test: true }
		 *                                            ^^^^^^^^^^
		 * Do: this.test = true
		 *
		 * Function Example:
		 * Blueprint: { name: "The Coin", cost: 0, cast(self, owner): { owner.refreshMana(1, owner.maxMana) } }
		 *                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
		 * Do: this.abilities.cast = [{ owner.addMana(1) }]
		 *                           ^                  ^
		 *                           This is in an array so we can add multiple events on casts
		 */
		for (const entry of Object.entries(this.blueprint)) {
			const [key, value] = entry;

			if (typeof value === "function") {
				this.abilities[key as Ability] = [value];
			} else {
				this[key as keyof this] = JSON.parse(JSON.stringify(entry[1]));
			}
		}

		// Set maxHealth if the card is a minion or weapon
		this.maxHealth = this.blueprint.health;

		if (this.heropowerId) {
			this.heropower = await Card.create(this.heropowerId, this.owner, true);
		}

		this.text = parseTags(this.text || "");
		if (trigger) {
			await this.trigger(Ability.Create);
		}
	}

	/**
	 * Adds an ability to the card
	 *
	 * @param ability The name of the ability
	 * @param callback The callback function to add to the ability
	 *
	 * @returns Success
	 */
	addAbility(ability: Ability, callback: AbilityCallback): boolean {
		if (!this.abilities[ability]) {
			this.abilities[ability] = [];
		}

		this.abilities[ability]?.push(callback);

		// Just in case we want this function to ever fail, we make it return success.
		return true;
	}

	// Keywords

	hasKeyword(keyword: Keyword): boolean {
		return Object.keys(this.keywords).includes(keyword);
	}

	/**
	 * Adds a keyword to the card
	 *
	 * @param keyword The keyword to add
	 *
	 * @returns Success
	 */
	addKeyword(keyword: Keyword, info?: unknown): boolean {
		if (this.hasKeyword(keyword)) {
			return false;
		}

		this.keywords[keyword] = info;

		switch (keyword) {
			case Keyword.Charge: {
				this.ready();

				break;
			}

			case Keyword.Rush: {
				this.ready();
				this.canAttackHero = false;

				break;
			}

			case Keyword.CantAttack: {
				this.exhaust();

				break;
			}

			case Keyword.UnlimitedAttacks: {
				this.ready();

				if (this.owner.weapon === this) {
					this.owner.canAttack = true;
				}

				break;
			}

			default: {
				break;
			}
		}

		return true;
	}

	/**
	 * Adds a keyword to the card
	 *
	 * @param keyword The keyword to add
	 *
	 * @returns Success
	 */
	removeKeyword(keyword: Keyword): boolean {
		if (!this.hasKeyword(keyword)) {
			return false;
		}

		delete this.keywords[keyword];

		return true;
	}

	/**
	 * Gets the information stored in a keyword
	 *
	 * @returns The info
	 */
	getKeyword(keyword: Keyword): unknown | false {
		if (!this.hasKeyword(keyword)) {
			return false;
		}

		return this.keywords[keyword];
	}

	/**
	 * Sets the information stored in a keyword. RETURNS FALSE IF THIS CARD DOESN'T ALREADY HAVE THIS KEYWORD.
	 *
	 * @returns Success
	 */
	setKeyword(keyword: Keyword, info: unknown): boolean {
		if (!this.hasKeyword(keyword)) {
			return false;
		}

		this.keywords[keyword] = info;

		return true;
	}

	/**
	 * Freeze the card.
	 * Broadcasts the `FreezeCard` event.
	 *
	 * @returns Success
	 */
	async freeze(): Promise<boolean> {
		this.addKeyword(Keyword.Frozen);

		await game.event.broadcast(Event.FreezeCard, this, this.owner);

		return true;
	}

	/**
	 * Mark a card as having attacked once, and if it runs out of attacks this turn, exhaust it.
	 *
	 * @returns Success
	 */
	decrementAttackTimes(): boolean {
		if (!this.attackTimes) {
			return false;
		}

		if (this.hasKeyword(Keyword.UnlimitedAttacks)) {
			return false;
		}

		this.attackTimes--;

		const shouldExhaust = this.attackTimes <= 0;
		if (shouldExhaust) {
			this.exhaust();
		}

		return true;
	}

	/**
	 * Makes this minion ready for attack.
	 *
	 * Sets the attack times of a card to;
	 * 1 if doesn't have windfury,
	 * 2 if it does,
	 * 4 if it has mega-windfury.
	 *
	 * @returns Success
	 */
	ready(): boolean {
		/*
		 * If the card can't attack, prevent it from being ready
		 * This will show the card as being "Exhausted" when you play it which is not exactly correct, but it's fine for now
		 */
		if (this.hasKeyword(Keyword.CantAttack)) {
			return false;
		}

		this.attackTimes = 1;

		if (this.hasKeyword(Keyword.Windfury)) {
			this.attackTimes = 2;
		}

		if (this.hasKeyword(Keyword.MegaWindfury)) {
			this.attackTimes = 4;
		}

		return true;
	}

	/**
	 * Make this card exhausted. It can't attack anymore this turn.
	 */
	exhaust() {
		this.attackTimes = 0;
	}

	// Change stats

	/**
	 * Sets the card's attack and health.
	 *
	 * @param attack The attack to set
	 * @param health The health to set
	 * @param changeMaxHealth If the card's max health should be reset to it's current health if the health increases from running this function.
	 *
	 * @returns Success
	 */
	async setStats(
		attack: number | undefined = this.attack,
		health: number | undefined = this.health,
		changeMaxHealth = true,
	): Promise<boolean> {
		if (this.attack === undefined || this.health === undefined) {
			return false;
		}

		this.attack = attack;
		this.health = health;

		if (changeMaxHealth) {
			this.resetMaxHealth(false);
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
	async addStats(attack = 0, health = 0): Promise<boolean> {
		if (this.attack === undefined || this.health === undefined) {
			return false;
		}

		this.attack += attack;
		await this.addHealth(health, false);

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
	async removeStats(attack = 0, health = 0): Promise<boolean> {
		if (this.attack === undefined || this.health === undefined) {
			return false;
		}

		this.attack -= attack;
		await this.removeHealth(health);

		return true;
	}

	/**
	 * Adds `amount` to the card's health
	 *
	 * @param amount The health to add
	 * @param restore If it should prevent the health from going over the max health. Defaults to true.
	 *
	 * @returns Success
	 */
	async addHealth(amount: number, restore = true): Promise<boolean> {
		if (this.health === undefined) {
			return false;
		}

		const before = this.health;
		this.health += amount;

		if (!restore) {
			this.resetMaxHealth(true);
			return true;
		}

		// Restore health

		if (this.maxHealth && this.health > this.maxHealth) {
			// Too much health

			// Overheal keyword
			await this.trigger(Ability.Overheal);

			this.health = this.maxHealth ?? -1;

			if (this.health > before) {
				await game.event.broadcast(
					Event.HealthRestored,
					this.maxHealth,
					this.owner,
				);
			}
		} else if (this.health > before) {
			await game.event.broadcast(Event.HealthRestored, this.health, this.owner);
		}

		return true;
	}

	/**
	 * Manually decreases this card's health. Ignores keywords. Consider calling {@link confirmAliveness} afterwards.
	 *
	 * @param amount The health to remove
	 * @returns Success
	 */
	async removeHealth(amount: number): Promise<boolean> {
		if (this.health === undefined) {
			return false;
		}

		await this.setStats(this.attack, this.health - amount);
		return true;
	}

	/**
	 * Makes sure that this card is alive. If not, remove it from wherever it is.
	 */
	async confirmAliveness(): Promise<void> {
		if (this.type === Type.Weapon && this.owner.weapon === this) {
			await this.owner.destroyWeapon();
		}

		await game.killCardsOnBoard();
	}

	/**
	 * Damages this card.
	 *
	 * Doesn't damage the card if it is a location card, is immune, or has Stealth.
	 *
	 * ### Use `game.damage` instead unless you have a good reason not to.
	 *
	 * @param amount The amount to damage this card by.
	 * @returns Success
	 */
	async damage(amount: number): Promise<boolean> {
		if (this.health === undefined) {
			return false;
		}

		// Don't allow location cards to be damaged
		if (this.type === Type.Location) {
			return false;
		}

		if (this.hasKeyword(Keyword.Stealth)) {
			return false;
		}

		if (this.hasKeyword(Keyword.Immune)) {
			return true;
		}

		await this.removeHealth(amount);
		await game.event.broadcast(Event.DamageCard, [this, amount], this.owner);
		await this.confirmAliveness();

		return true;
	}

	/**
	 * Sets the max health of the card to it's current health. If check is true it only sets the max health if the current health is above it.
	 *
	 * @param check Prevent lowering it's max health
	 *
	 * @returns If it reset the card's max health.
	 */
	resetMaxHealth(check = false): boolean {
		if (this.health === undefined) {
			return false;
		}

		if (!this.maxHealth) {
			return false;
		}

		if (check && this.health <= this.maxHealth) {
			return false;
		}

		this.maxHealth = this.health;
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
		this.stealthDuration = game.turn + duration;

		return true;
	}

	/**
	 * Sets the location of the card.
	 *
	 * @param location The new location of the card.
	 */
	async setLocation(location: Location): Promise<void> {
		this.location = location;

		if (location === Location.None) {
			game.functions.util.remove(game.activeCards, this);
		} else if (!game.activeCards.includes(this)) {
			game.activeCards.push(this);
		}

		await game.event.broadcast(
			Event.ChangeLocation,
			[this, location],
			this.owner,
		);
	}

	/**
	 * Moves this card to its corresponding owner's locations.
	 *
	 * If this card is in its owner's opponent's hand, move it to it's owner's hand.
	 *
	 * @returns If it moved the card.
	 */
	async confirmAlignment(): Promise<boolean> {
		const opponent = this.owner.getOpponent();

		if (opponent.board.includes(this)) {
			game.functions.util.remove(opponent.board, this);

			await game.event.withSuppressed(Event.SummonCard, async () => {
				await this.owner.summon(this);
			});

			return true;
		}

		if (opponent.hand.includes(this)) {
			game.functions.util.remove(opponent.hand, this);

			await game.event.withSuppressed(Event.AddCardToHand, async () => {
				await this.owner.addToHand(this);
			});

			return true;
		}

		if (opponent.deck.includes(this)) {
			game.functions.util.remove(opponent.deck, this);

			await game.event.withSuppressed(Event.AddCardToDeck, async () => {
				await this.owner.shuffleIntoDeck(this);
			});

			return true;
		}

		if (opponent.graveyard.includes(this)) {
			game.functions.util.remove(opponent.graveyard, this);
			this.owner.graveyard.push(this);

			return true;
		}

		return false;
	}

	/**
	 * @returns If this card can attack.
	 */
	canAttack(): boolean {
		if (this.type === Type.Weapon) {
			return this.attackTimes! > 0;
		}

		if (this.type !== Type.Minion) {
			return false;
		}

		if (this.getKeyword(Keyword.Titan) as number[] | false) {
			// The card still has titan cards
			return false;
		}

		const booleans =
			this.attackTimes > 0 &&
			!this.hasKeyword(Keyword.Frozen) &&
			!this.hasKeyword(Keyword.Dormant) &&
			!this.hasKeyword(Keyword.CantAttack);

		const numbers = this.attack! > 0 && this.attackTimes! > 0;

		return booleans && numbers;
	}

	/**
	 * @returns If this card can be attacked
	 */
	canBeAttacked(): boolean {
		return (
			!this.hasKeyword(Keyword.Dormant) &&
			!this.hasKeyword(Keyword.Immune) &&
			!this.hasKeyword(Keyword.Stealth)
		);
	}

	/**
	 * Create a backup of the card.
	 *
	 * @returns The key of the backup. You can use it by doing `card.backups[key]`
	 */
	createBackup(): number {
		const index = Object.keys(this.backups).length;

		for (const entry of Object.entries(this)) {
			// HACK: Never usage
			this.backups[index][entry[0] as never] = entry[1] as never;
		}

		return index;
	}

	/**
	 * Restore a backup of the card.
	 *
	 * @param backup The backup to restore. It is recommended to supply a backup from `card.backups`.
	 *
	 * @returns Success
	 */
	restoreBackup(backup: CardBackup): boolean {
		for (const key of Object.keys(backup)) {
			// HACK: Never usage
			this[key as never] = backup[key as keyof Card] as never;
		}

		return true;
	}

	/**
	 * Bounces the card to the `player`'s hand.
	 *
	 * @param player
	 */
	async bounce(player: Player = this.owner): Promise<boolean> {
		this.owner = player;
		await player.addToHand(this.perfectCopy());
		await this.removeFromPlay();
		return true;
	}

	// Doom buttons

	/**
	 * Destroys the card.
	 *
	 * This sets the card's health to 0, then forces the game to remove dead cards from the board.
	 *
	 * @returns Success
	 */
	async destroy(): Promise<boolean> {
		await this.setStats(this.attack, 0);
		await game.killCardsOnBoard();
		return true;
	}

	/**
	 * Silences the card.
	 *
	 * @returns Success
	 */
	async silence(): Promise<boolean> {
		/*
		 * Tell the minion to undo it's passive.
		 * The false tells the minion that this is the last time it will call remove
		 * so it should finish whatever it is doing.
		 */
		const removeReturn = await this.trigger(
			Ability.Remove,
			RemoveReason.Silence,
		);

		// If the remove function returned false, then we should not silence.
		if (Array.isArray(removeReturn) && removeReturn.includes(false)) {
			return false;
		}

		// Remove abilities from the card.
		for (const ability of Object.keys(this.abilities)) {
			this.abilities[ability as Ability] = [];
		}

		for (const key of Object.keys(this)) {
			if (key === "health" && this.health! < this.backups.init.health!) {
				continue;
			}

			if (key === "attackTimes") {
				continue;
			}

			/*
			 * Check if a backup exists for the attribute. If it does; restore it.
			 * HACK: Never usage
			 */
			if (this.backups.init[key as never]) {
				this[key as never] = this.backups.init[key as never];
			} else if (this.blueprint[key as never]) {
				/*
				 * Check if the attribute if defined in the blueprint. If it is; restore it.
				 * HACK: Never usage
				 */
				this[key as never] = this.blueprint[key as never];
			}
		}

		// Don't strikethrough the text if the card doesn't have text (e.g. Sheep)
		if (this.text) {
			this.text = `<strikethrough>${this.text}</strikethrough>`;
		}

		this.keywords = {};

		// Remove active enchantments.
		this.activeEnchantments = [];
		await this.refreshEnchantments();

		await game.event.broadcast(Event.SilenceCard, this, this.owner);

		await game.killCardsOnBoard();
		return true;
	}

	/**
	 * Removes the card from play.
	 *
	 * This will silence the card and destroy it.
	 */
	async removeFromPlay(): Promise<void> {
		await this.silence();
		await this.destroy();

		await this.setLocation(Location.None);
	}

	/**
	 * Resets this card to its original state.
	 */
	async reset(): Promise<void> {
		// Silence it to remove any new abilities
		await game.event.withSuppressed(
			Event.SilenceCard,
			async () => await this.silence(),
		);
		this.restoreBackup(this.backups.init);
	}

	/**
	 * Reloads this card. This will set the card's state to the default one from its blueprint.
	 *
	 * If the blueprint has changed since the last time it was loaded, it will apply the new blueprint to this card.
	 *
	 * Run this after having reloaded the blueprints to apply the new changes to this card.
	 */
	async reload(): Promise<void> {
		await this.reset();
		await this.doBlueprint();
	}

	// Handling functions

	/**
	 * Trigger one of this card's abilities.
	 *
	 * @param key The ability to trigger.
	 * @param parameters The parameters to pass to the ability callback.
	 *
	 * @returns All the return values of the abilities.
	 */
	async trigger(
		key: Ability,
		...parameters: any[]
	): Promise<unknown[] | typeof Card.REFUND | false> {
		/*
		 * Example: trigger(Ability.Cast)
		 * Does: this.cast.forEach(castFunc => castFunc(card, owner))
		 */
		const abilities: AbilityCallback[] | undefined = this.abilities[key];
		if (!abilities) {
			return false;
		}

		const uncancellable =
			game.config.advanced.uncancellableAbilities.includes(key);
		const noBounceOnCancel =
			game.config.advanced.noBounceOnCancelAbilities.includes(key);

		let returnValue: unknown[] | typeof Card.REFUND = [];

		for (const ability of abilities) {
			if (returnValue === Card.REFUND) {
				continue;
			}

			const result = await ability(this, this.owner, ...parameters);

			// Add result to the returnValue.
			if (Array.isArray(returnValue)) {
				if (result === Card.REFUND && uncancellable) {
					returnValue.push("bypass cancel");
				} else {
					returnValue.push(result);
				}
			}

			if (result !== Card.REFUND || uncancellable) {
				continue;
			}

			// If the return value is Card.REFUND, refund the card.
			await game.event.broadcast(Event.CancelCard, [this, key], this.owner);

			returnValue = Card.REFUND;
			this.owner[this.costType] += this.cost;

			if (!noBounceOnCancel) {
				/*
				 * We have to suppress inside the loop in order to not have the event suppressed when calling the ability
				 * It's a bit hacky, and not very efficient, but it works
				 */
				await game.event.withSuppressed(Event.AddCardToHand, async () =>
					this.owner.addToHand(this),
				);
			}
		}

		return returnValue;
	}

	/**
	 * @param m How much mana the player needs to succeed the manathirst test.
	 *
	 * @returns If the player has enough mana
	 */
	manathirst(m: number): boolean {
		return this.owner.emptyMana >= m;
	}

	/**
	 * Discards this card from a player's hand.
	 * Broadcasts the `DiscardCard` event if the card was successfully discarded.
	 *
	 * @param player The player to discard the card from. Defaults to the card's owner
	 *
	 * @returns If the card was successfully discarded
	 */
	async discard(player = this.owner): Promise<boolean> {
		const returnValue = game.functions.util.remove(player.hand, this);

		if (returnValue) {
			this.setLocation(Location.None);
			await game.event.broadcast(Event.DiscardCard, this, player);
		}

		return returnValue;
	}

	/**
	 * Checks if the condition is met, and if it is, adds `(Condition cleared!)` to the description
	 *
	 * @param [overrideHandCheck=false] If this is true, it will add the condition cleared text even when the card isn't in the player's hand.
	 *
	 * @returns If the condition is met
	 */
	async condition(overrideHandCheck = false): Promise<boolean> {
		const clearedText = " <bright:green>(Condition cleared!)</bright:green>";
		const clearedTextAlternative =
			"<bright:green>Condition cleared!</bright:green>";

		// Remove the (Condition cleared!) from the description
		this.text = this.text.replaceAll(clearedText, "");
		this.text = this.text.replaceAll(clearedTextAlternative, "");

		// Check if the condition is met
		const condition = await this.trigger(Ability.Condition);
		if (!Array.isArray(condition) || condition.includes(false)) {
			return false;
		}

		if (this.location === Location.Hand || overrideHandCheck) {
			// Add the (Condition cleared!) to the description
			this.text += this.text ? clearedText : clearedTextAlternative;
		}

		return true;
	}

	/**
	 * Runs through this card's enchantments list and applies each enchantment based on their priorities.
	 *
	 * @param [inbetweenCallback=() => {}] This gets called inbetween removing and adding the enchantments.
	 * @returns Success
	 */
	async refreshEnchantments(
		inbetweenCallback = async () => {},
	): Promise<boolean> {
		// Don't waste resources if this card doesn't have any enchantments, this gets called every tick after all.
		if (this.activeEnchantments.length <= 0) {
			return false;
		}

		if (this.activeEnchantments.length > 1) {
			this.activeEnchantments.sort((aeA, aeB) => {
				const priorityA = aeA.enchantment.enchantmentPriority;
				if (priorityA === undefined) {
					throw new Error(
						`Enchantment with id '${aeA.enchantment.id}' does not specify a priority.`,
					);
				}

				const priorityB = aeB.enchantment.enchantmentPriority;
				if (priorityB === undefined) {
					throw new Error(
						`Enchantment with id '${aeB.enchantment.id}' does not specify a priority.`,
					);
				}

				return priorityB - priorityA;
			});
		}

		const callOnActiveEnchantments = async (
			callback: (
				enchantment: Card,
				applied: boolean,
				i: number,
			) => Promise<unknown>,
		) => {
			let i = 0;
			for (const activeEnchantment of this.activeEnchantments) {
				// const owner = activeEnchantment.owner;
				const applied = activeEnchantment.hasBeenSetUp;
				const enchantment = activeEnchantment.enchantment;
				const priority = enchantment.enchantmentPriority;

				// A priority of 0 (Normal) is valid.
				if (priority === undefined) {
					throw new Error(
						`Enchantment with id '${enchantment.id}' does not specify a priority.`,
					);
				}

				await callback(enchantment, applied, i);
				i++;
			}
		};

		// Remove ALL enchantment effects.
		await callOnActiveEnchantments(async (enchantment, applied, i) => {
			if (applied) {
				await enchantment.trigger(Ability.EnchantmentRemove, this);
			} else {
				this.activeEnchantments[i].hasBeenSetUp = true;
				await enchantment.trigger(Ability.EnchantmentSetup, this);
			}
		});

		await inbetweenCallback();

		// Re-add ALL enchantment effects.
		await callOnActiveEnchantments(async (enchantment, _, i) => {
			await enchantment.trigger(Ability.EnchantmentApply, this);
		});

		return true;
	}

	/**
	 * Add an enchantment to the card.
	 *
	 * @param enchantmentId The id of the enhantment card.
	 * @param owner The creator of the enchantment. This will allow removing or looking up enchantment later.
	 *
	 * @returns Success
	 */
	async addEnchantment(enchantmentId: string, owner: Card): Promise<boolean> {
		const enchantment = await Card.create(enchantmentId, owner.owner);
		if (enchantment.type !== Type.Enchantment) {
			return false;
		}

		this.activeEnchantments.push({
			enchantment: await enchantment.imperfectCopy(),
			owner,
			hasBeenSetUp: false,
		});
		await this.refreshEnchantments();
		return true;
	}

	/**
	 * Checks if an enchantment exists.
	 *
	 * @param enchantmentId The id of the enchantment to check for.
	 * @param owner The owner of the enchantment. This needs to be correct to find the right enchantment.
	 *
	 * @returns If the enchantment exists
	 */
	enchantmentExists(enchantmentId: string, owner: Card): boolean {
		return this.activeEnchantments.some(
			(c) => c.enchantment.id === enchantmentId && c.owner === owner,
		);
	}

	/**
	 * Removes an enchantment.
	 *
	 * @param enchantmentId The id of the enchantment to remove
	 * @param owner The owner of the enchantment.
	 *
	 * @returns Success
	 */
	async removeEnchantment(
		enchantmentId: string,
		owner: Card,
	): Promise<boolean> {
		const activeEnchantment = this.activeEnchantments.find(
			(c) => c.enchantment.id === enchantmentId && c.owner === owner,
		);

		if (!activeEnchantment) {
			return false;
		}

		// Trigger remove.
		await activeEnchantment.enchantment.trigger(
			Ability.EnchantmentRemove,
			this,
		);

		game.functions.util.remove(this.activeEnchantments, activeEnchantment);
		await activeEnchantment.enchantment.removeFromPlay();

		await this.refreshEnchantments();
		return true;
	}

	/**
	 * Gets the value indexed by `key` before enchantments are applied.
	 *
	 * ### Performance Note
	 * This calls `refreshEnchantments`, which is a heavy function call. Be careful not to call this too often.
	 *
	 * @param key The key to index by.
	 * @returns The unaltered value.
	 */
	async getFixedValue<T extends keyof Card>(key: T): Promise<Card[T]> {
		let ret: Card[T] | "__HJS_UNDEFINED__" = "__HJS_UNDEFINED__";

		await this.refreshEnchantments(async () => {
			ret = this[key];
		});

		if (ret === "__HJS_UNDEFINED__") {
			throw new Error("Unable to set ret in 'getFixedValue'.");
		}

		return ret;
	}

	/**
	 * Replaces placeholders in the description of this card.
	 *
	 * @param overrideText The description. If empty, it uses this card's description instead.
	 * @param _depth The depth of recursion.
	 *
	 * @returns The modified description with placeholders replaced.
	 */
	async replacePlaceholders(overrideText = "", _depth = 0): Promise<string> {
		let text = overrideText || this.text;

		const spellDamage = /\$(\d+)/.test(text);
		if (!spellDamage && !this.abilities.placeholders) {
			return text;
		}

		const temporaryPlaceholders = await this.trigger(Ability.Placeholders);
		if (!spellDamage && !Array.isArray(temporaryPlaceholders)) {
			return text;
		}

		if (Array.isArray(temporaryPlaceholders)) {
			const placeholders = temporaryPlaceholders[0] as Record<
				string,
				string | Card | undefined
			>;

			if (!(placeholders instanceof Object)) {
				console.log(this.name);
				throw new Error("Invalid placeholders");
			}

			const reg = /{(.*?)}/;

			let running = true;
			while (running) {
				const regedDesc = reg.exec(text);

				// There is nothing more to extract
				if (!regedDesc) {
					running = false;
					break;
				}

				// Get the capturing group result
				const key = regedDesc[1];

				let replacement = placeholders[key];
				if (replacement === undefined) {
					/*
					 * Replace the key with something else to ignore it.
					 * This will prevent infinite recursion.
					 * Later on, if we replace `__hsjs__ignore:` with `{`,
					 * it will restore the original text.
					 */
					text = text.replace(reg, `__hsjs__ignore:${key}}`);
					continue;
				}

				if (replacement instanceof Card) {
					// The replacement is a card
					const onlyShowName =
						game.config.advanced.getReadableCardNoRecursion ||
						!game.player.detailedView;

					const alwaysShowFullCard =
						game.config.advanced.getReadableCardAlwaysShowFullCard;

					replacement =
						onlyShowName && !alwaysShowFullCard
							? replacement.colorFromRarity()
							: await replacement.readable(-1, _depth + 1);
				}

				text = parseTags(text.replace(reg, replacement));
			}
		}

		// Replace spell damage placeholders
		const reg = /\$(\d+)/;

		let running = true;
		while (running) {
			const regedDesc = reg.exec(text);
			if (!regedDesc) {
				running = false;
				break;
			}

			// Get the capturing group result
			const key = regedDesc[1];
			const replacement = game.lodash.parseInt(key) + game.player.spellDamage;

			text = text.replace(reg, replacement.toString());
		}

		return text.replaceAll("__hsjs__ignore:", "{");
	}

	/**
	 * Sets a value in this card's storage. @see {@link storage} for more info.
	 *
	 * @param uuid The manager's uuid.
	 * @param key The key to store the value in.
	 * @param value The value to store.
	 */
	setStorage(uuid: string, key: string, value: any) {
		if (!this.storage[uuid]) {
			this.storage[uuid] = {};
		}

		this.storage[uuid][key] = value;
	}

	/**
	 * Gets a value from this card's storage. @see {@link storage} for more info.
	 *
	 * @param uuid The manager's uuid.
	 * @param key The key that the value is stored in.
	 * @returns The value.
	 */
	getStorage(uuid: string, key: string): any | undefined {
		return this.storage[uuid]?.[key];
	}

	/**
	 * Return a perfect copy of this card. This will perfectly clone the card. This happens when, for example, a card gets temporarily removed from the board using card.destroy, then put back on the board.
	 *
	 * @example
	 * const cloned = card.perfectCopy();
	 *
	 * // This will actually fail since they're slightly different, but you get the point
	 * assert.equal(cloned, card);
	 *
	 * @returns A perfect copy of this card.
	 */
	perfectCopy(): this {
		const clone = game.lodash.clone(this);

		clone.randomizeUUID();
		clone.exhaust();
		clone.turnCreated = game.turn;

		game.activeCards.push(clone);
		return clone;
	}

	/**
	 * Return an imperfect copy of this card. This happens when, for example, a card gets shuffled into your deck in vanilla Hearthstone.
	 *
	 * @example
	 * const cloned = await card.imperfectCopy();
	 * const cloned2 = await Card.create(card.id, card.owner);
	 *
	 * // This will actually fail since they're slightly different, but you get the point
	 * assert.equal(cloned, cloned2);
	 *
	 * @returns An imperfect copy of this card.
	 */
	async imperfectCopy(): Promise<Card> {
		return Card.create(this.id, this.owner);
	}

	/**
	 * @returns If the card specified has the ability to appear on the board.
	 */
	canBeOnBoard(): boolean {
		return this.type === Type.Minion || this.type === Type.Location;
	}

	/**
	 * @returns If this card has stats
	 */
	hasStats(): boolean {
		return this.type === Type.Minion || this.type === Type.Weapon;
	}

	/**
	 * @returns If this card is alive
	 */
	isAlive(): boolean {
		if (this.health !== undefined) {
			return this.health > 0;
		}

		if (this.durability !== undefined) {
			return this.durability > 0;
		}

		return false;
	}

	/**
	 * Checks if this card is a valid card to put into its players deck
	 *
	 * @returns Success | Errorcode
	 */
	validateForDeck(): DeckValidationError {
		if (!this.classes.includes(this.owner.heroClass)) {
			// If it is a neutral card, it is valid
			if (this.classes.includes(Class.Neutral)) {
				// Valid
			} else {
				return DeckValidationError.Class;
			}
		}

		if (!this.collectible) {
			return DeckValidationError.Uncollectible;
		}

		// Runes
		if (this.runes && !this.owner.testRunes(this.runes)) {
			return DeckValidationError.Runes;
		}

		return DeckValidationError.Success;
	}

	/**
	 * Asks the user a `prompt` and show 3 choices for the player to choose, and do something to the minion based on the choice.
	 *
	 * @param prompt The prompt to ask the user
	 * @param _values DON'T TOUCH THIS UNLESS YOU KNOW WHAT YOU'RE DOING
	 *
	 * @returns An array with the name of the adapt(s) chosen, or -1 if the user cancelled.
	 */
	async adapt(
		prompt = "Choose One:",
		_values: string[][] = [],
	): Promise<string | -1> {
		await game.functions.interact.print.gameState(game.player);

		const possibleCards = [
			["Crackling Shield", "Divine Shield"],
			["Flaming Claws", "+3 Attack"],
			["Living Spores", "Deathrattle: Summon two 1/1 Plants."],
			["Lightning Speed", "Windfury"],
			["Liquid Membrane", "Can't be targeted by spells or Hero Powers."],
			["Massive", "Taunt"],
			["Volcanic Might", "+1/+1"],
			["Rocky Carapace", "+3 Health"],
			["Shrouding Mist", "Stealth until your next turn."],
			["Poison Spit", "Poisonous"],
		];

		const values = _values;

		if (values.length === 0) {
			for (let i = 0; i < 3; i++) {
				const card = game.lodash.sample(possibleCards);
				if (!card) {
					throw new Error("undefined when randomly choosing adapt option");
				}

				values.push(card);
				game.functions.util.remove(possibleCards, card);
			}
		}

		let p = `\n${prompt}\n[\n`;

		for (const [index, value] of values.entries()) {
			// Check for a TypeError and ignore it
			try {
				p += `${index + 1}: ${value[0]}; ${value[1]},\n`;
			} catch {}
		}

		p = p.slice(0, -2);
		p += "\n] ";

		let choice = await game.input(p);
		if (!game.lodash.parseInt(choice)) {
			await game.pause("<red>Invalid choice!</red>\n");
			return this.adapt(prompt, values);
		}

		if (game.lodash.parseInt(choice) > 3) {
			return this.adapt(prompt, values);
		}

		choice = values[game.lodash.parseInt(choice) - 1][0];

		switch (choice) {
			case "Crackling Shield": {
				this.addKeyword(Keyword.DivineShield);
				break;
			}

			case "Flaming Claws": {
				await this.addStats(3, 0);
				break;
			}

			case "Living Spores": {
				this.addAbility(Ability.Deathrattle, async (_, owner) => {
					owner.summon(
						await Card.create(
							game.cardIds.plant_5fe7a8b5_d5e5_4018_a483_32fd3a553d16,
							owner,
						),
					);
					owner.summon(
						await Card.create(
							game.cardIds.plant_5fe7a8b5_d5e5_4018_a483_32fd3a553d16,
							owner,
						),
					);
				});
				break;
			}

			case "Lightning Speed": {
				this.addKeyword(Keyword.Windfury);
				break;
			}

			case "Liquid Membrane": {
				this.addKeyword(Keyword.Elusive);
				break;
			}

			case "Massive": {
				this.addKeyword(Keyword.Taunt);
				break;
			}

			case "Volcanic Might": {
				await this.addStats(1, 1);
				break;
			}

			case "Rocky Carapace": {
				await this.addStats(0, 3);
				break;
			}

			case "Shrouding Mist": {
				this.addKeyword(Keyword.Stealth);
				this.setStealthDuration(1);
				break;
			}

			case "Poison Spit": {
				this.addKeyword(Keyword.Poisonous);
				break;
			}

			default: {
				break;
			}
		}

		return choice;
	}

	/**
	 * Bumps the invoke count for a card.
	 *
	 * @param storageName The name where the info is stored. I recommend "invokeCount". You can get that information using `card.getStorage(self.uuid, storageName)` afterwards.
	 */
	galakrondBump(storageName: string): void {
		if (!this.storage[this.uuid][storageName]) {
			this.storage[this.uuid][storageName] = 0;
		}

		if (this.storage[this.uuid][storageName] >= 3) {
			this.storage[this.uuid][storageName] = 3;
		}

		this.storage[this.uuid][storageName]++;
	}

	/**
	 * Decrements the infuse count by 1.
	 * Activates the card's infuse ability if the infuse count is 0.
	 *
	 * @returns Success
	 */
	async tryInfuse(): Promise<boolean> {
		const infuse = this.getKeyword(Keyword.Infuse) as number | undefined;
		if (!infuse || infuse <= 0) {
			return false;
		}

		const newInfuse = infuse - 1;

		this.setKeyword(Keyword.Infuse, newInfuse);
		if (newInfuse > 0) {
			return false;
		}

		await this.trigger(Ability.Infuse);
		return true;
	}

	/**
	 * @param text The text to add the the color to. Defaults to this card's name
	 */
	colorFromRarity(text = this.name): string {
		return game.functions.color.fromRarity(text, this.rarity);
	}

	/**
	 * @param length How many characters of the UUID to return
	 *
	 * @returns A colored version of the card's UUID.
	 */
	coloredUUID(length = 7): string {
		return parseTags(
			`<#${this.uuid.slice(0, 6)}>${this.uuid.slice(0, length)}</#>`,
		);
	}

	/**
	 * Takes control of the card by changing its owner.
	 *
	 * @param newOwner The new owner of the card.
	 */
	async takeControl(newOwner: Player): Promise<void> {
		game.functions.util.remove(this.owner.board, this);

		this.owner = newOwner;
		await newOwner.summon(this);
	}

	/**
	 * Makes this card attack a minion or hero
	 *
	 * This is just a shortcut for `game.attack(this, target, flags)`. Whether to use this or `game.attack` is up to you and your preferences.
	 *
	 * @param target The target
	 * @param flags An object with boolean properties to modify the behavior of the attack (e.g., { force: true })
	 *
	 * @returns Success | Errorcode
	 */
	attackTarget(target: Target, flags: GameAttackFlags = {}) {
		return game.attack(this, target, flags);
	}

	/**
	 * Returns this card in a human readable state. If you "console.log" the result of this, the user will get all the information they need from this card.
	 *
	 * @param i If this is set, this function will add `[i]` to the beginning of the string. This is useful if there are many different cards to choose from.
	 * @param _depth The depth of recursion. DO NOT SET THIS MANUALLY.
	 *
	 * @returns The human readable card string
	 */
	async readable(i = -1, _depth = 0): Promise<string> {
		// If it should show detailed errors regarding depth.
		const showDetailedError: boolean = game.player.detailedView;

		if (_depth > 0 && game.config.advanced.getReadableCardNoRecursion) {
			if (showDetailedError) {
				return "RECURSION ATTEMPT BLOCKED";
			}

			return "...";
		}

		if (_depth > game.config.advanced.getReadableCardMaxDepth) {
			if (showDetailedError) {
				return "MAX DEPTH REACHED";
			}

			return "...";
		}

		let sb = "";

		let text = (this.text || "").length > 0 ? ` (${this.text}) ` : " ";
		text = await this.replacePlaceholders(text, _depth);

		let cost = `{${this.cost}} `;

		switch (this.costType) {
			case "mana": {
				cost = `<cyan>${cost}</cyan>`;
				break;
			}

			case "armor": {
				cost = `<gray>${cost}</gray>`;
				break;
			}

			case "health": {
				cost = `<red>${cost}</red>`;
				break;
			}

			default: {
				break;
			}
		}

		if (i !== -1) {
			sb += `[${i}] `;
		}

		sb += cost;
		sb += this.colorFromRarity(this.name);

		if (
			game.isDebugSettingEnabled(game.config.debug.additionalInfoInReadable)
		) {
			sb += " (";

			const id = this.id.slice(0, 6);
			sb += `#<#${id}>${id}</#>`;
			sb += ` @${this.coloredUUID()}`;

			if (this.tags.length > 0) {
				sb += ` <gray>[${this.tags.join(", ")}]</gray>`;
			}

			sb += ")";
		}

		if (this.hasStats()) {
			const titan = this.getKeyword(Keyword.Titan) as number[] | false;

			sb += titan
				? game.functions.color.if(
						this.attackTimes > 0,
						"bright:green",
						` [${titan.length} Abilities Left]`,
					)
				: game.functions.color.if(
						this.canAttack(),
						"bright:green",
						` [${this.attack} / ${this.health}]`,
					);
		} else if (this.type === Type.Location) {
			const durability = this.durability;
			const maxDurability = this.backups.init.durability;
			const maxCooldown = this.backups.init.cooldown!;

			sb += ` {<bright:green>Durability: ${durability} / ${maxDurability}</bright:green>,`;
			sb += ` <cyan>Cooldown: ${this.cooldown} / ${maxCooldown}</cyan>}`;
		}

		sb += text;
		sb += `<yellow>(${this.type})</yellow>`;

		// Add the keywords
		// TODO: `DivineShield` => `Divine Shield`.
		sb += Object.keys(this.keywords)
			.map((keyword) => ` <gray>{${keyword}}</gray>`)
			.join("");

		return sb;
	}
}
