import type { Card } from "@Game/card.ts";
import type { Player } from "@Game/player.ts";
import type { Event } from "@Game/types.ts";
import type { Card as _VanillaCard } from "@hearthstonejs/vanillatypes";

export type VanillaCard = _VanillaCard;

/**
 * Ai scored card
 */
export type ScoredCard = {
	card: Card;
	score: number;
};

/**
 * The location of a card.
 */
export enum Location {
	None = "None",
	Hand = "Hand",
	Deck = "Deck",
	Board = "Board",
	Graveyard = "Graveyard",
	Hero = "Hero",
	Other = "Other",
}

export enum EnchantmentPriority {
	Highest = "highest",
	High = "high",
	Normal = "normal",
	Low = "low",
	Lowest = "lowest",
}

/**
 * Card Enchantment object.
 */
export type EnchantmentDefinition = {
	enchantment: Card;
	owner: Card;
};

/**
 * A backup of a card.
 */
export type CardBackup = {
	[key in keyof Card]: Card[key];
};

/**
 * The type of the card.
 */
export enum Type {
	Minion = "Minion",
	Spell = "Spell",
	Weapon = "Weapon",
	Hero = "Hero",
	Location = "Location",
	HeroPower = "HeroPower",
	Enchantment = "Enchantment",
	Undefined = "Undefined",
}

/**
 * The class that the card belongs to.
 */
export enum Class {
	Neutral = "Neutral",
	DeathKnight = "DeathKnight",
	DemonHunter = "DemonHunter",
	Druid = "Druid",
	Hunter = "Hunter",
	Mage = "Mage",
	Paladin = "Paladin",
	Priest = "Priest",
	Rogue = "Rogue",
	Shaman = "Shaman",
	Warlock = "Warlock",
	Warrior = "Warrior",
}

/**
 * The rarity of the card.
 */
export enum Rarity {
	Free = "Free",
	Common = "Common",
	Rare = "Rare",
	Epic = "Epic",
	Legendary = "Legendary",
}

/**
 * What the card costs.
 */
export enum CostType {
	// NOTE: Use camelCase for these values since it accesses fields of the players.
	Mana = "mana",
	Armor = "armor",
	Health = "health",
}

/**
 * The school of the spell.
 */
export enum SpellSchool {
	None = "None",
	Arcane = "Arcane",
	Fel = "Fel",
	Fire = "Fire",
	Frost = "Frost",
	Holy = "Holy",
	Nature = "Nature",
	Shadow = "Shadow",
}

/**
 * The tribe of the minion.
 */
export enum MinionTribe {
	None = "None",
	All = "All",
	Beast = "Beast",
	Demon = "Demon",
	Dragon = "Dragon",
	Elemental = "Elemental",
	Mech = "Mech",
	Murloc = "Murloc",
	Naga = "Naga",
	Pirate = "Pirate",
	Quilboar = "Quilboar",
	Totem = "Totem",
	Undead = "Undead",
}

/**
 * Card keywords.
 */
export enum Keyword {
	DivineShield = "DivineShield",
	Dormant = "Dormant",
	Lifesteal = "Lifesteal",
	Poisonous = "Poisonous",
	Reborn = "Reborn",
	Rush = "Rush",
	Stealth = "Stealth",
	Taunt = "Taunt",
	Tradeable = "Tradeable",
	Forge = "Forge",
	Windfury = "Windfury",
	Outcast = "Outcast",
	CastOnDraw = "CastOnDraw",
	SummonOnDraw = "SummonOnDraw",
	Unbreakable = "Unbreakable",
	UnlimitedAttacks = "UnlimitedAttacks",
	Charge = "Charge",
	MegaWindfury = "MegaWindfury",
	Echo = "Echo",
	Magnetic = "Magnetic",
	Twinspell = "Twinspell",
	Elusive = "Elusive",
	Frozen = "Frozen",
	Immune = "Immune",
	Corrupt = "Corrupt",
	Colossal = "Colossal",
	Infuse = "Infuse",
	Cleave = "Cleave",
	Titan = "Titan",
	Forgetful = "Forgetful",
	CantAttack = "CantAttack",
}

/**
 * Card tags.
 */
export enum CardTag {
	StartingHero = "StartingHero",
	Galakrond = "Galakrond",
	Totem = "Totem",
	Lackey = "Lackey",
	DIY = "Diy",
	Quest = "Quest",
}

/*
 * These are the abilities that cards can have.
 */
export enum Ability {
	// NOTE: Use camelCase here since these will be converted to methods.
	Adapt = "adapt",
	Battlecry = "battlecry",
	Cast = "cast",
	Combo = "combo",
	Deathrattle = "deathrattle",
	Finale = "finale",
	Frenzy = "frenzy",
	HonorableKill = "honorableKill",
	Infuse = "infuse",
	Inspire = "inspire",
	Invoke = "invoke",
	Outcast = "outcast",
	Overheal = "overheal",
	Overkill = "overkill",
	Passive = "passive",
	Spellburst = "spellburst",
	StartOfGame = "startOfGame",
	HeroPower = "heropower",
	Use = "use",

	EnchantmentApply = "enchantmentApply",
	EnchantmentRemove = "enchantmentRemove",
	Placeholders = "placeholders",
	Condition = "condition",
	Remove = "remove",
	HandPassive = "handPassive",
	Tick = "tick",
	HandTick = "handTick",
	Test = "test",
	Create = "create",
}

/**
 * The ability callback used by most abilities.
 */
export type AbilityCallback = (
	self: Card,
	owner: Player,
	key?: Event,
	value?: unknown,
	eventPlayer?: Player,
) => Promise<unknown>;

/**
 * The ability callback used by the enchantment abilities.
 */
export type EnchantmentAbilityCallback = (
	owner: Player,
	self: Card,
	host: Card,
) => Promise<unknown>;

export type AbilityCallbacks = {
	[Ability.Adapt]: AbilityCallback;
	[Ability.Battlecry]: AbilityCallback;
	[Ability.Cast]: AbilityCallback;
	[Ability.Combo]: AbilityCallback;
	[Ability.Condition]: AbilityCallback;
	[Ability.Create]: AbilityCallback;
	[Ability.Deathrattle]: AbilityCallback;
	[Ability.EnchantmentApply]: EnchantmentAbilityCallback;
	[Ability.EnchantmentRemove]: EnchantmentAbilityCallback;
	[Ability.Finale]: AbilityCallback;
	[Ability.Frenzy]: AbilityCallback;
	[Ability.HandPassive]: AbilityCallback;
	[Ability.HandTick]: AbilityCallback;
	[Ability.HeroPower]: AbilityCallback;
	[Ability.HonorableKill]: AbilityCallback;
	[Ability.Infuse]: AbilityCallback;
	[Ability.Inspire]: AbilityCallback;
	[Ability.Invoke]: AbilityCallback;
	[Ability.Outcast]: AbilityCallback;
	[Ability.Overheal]: AbilityCallback;
	[Ability.Overkill]: AbilityCallback;
	[Ability.Passive]: AbilityCallback;
	[Ability.Placeholders]: AbilityCallback;
	[Ability.Remove]: AbilityCallback;
	[Ability.Spellburst]: AbilityCallback;
	[Ability.StartOfGame]: AbilityCallback;
	[Ability.Test]: AbilityCallback;
	[Ability.Tick]: AbilityCallback;
	[Ability.Use]: AbilityCallback;
};

/**
 * The abilities that a blueprint can have. (From CardAbility)
 */
type BlueprintAbilities = {
	[key in Ability]?: AbilityCallbacks[key];
};

/**
 * The blueprint of a card.
 *
 * If a field doesn't have:
 * ### This is required for Xs and Ys
 * Then it is required by every card.
 */
export interface Blueprint extends BlueprintAbilities {
	// Common
	/** The name of the card. This doesn't have to be unique. */
	name: string;
	/**
	 * The text / description of the card. You should describe what the card DOES in here.
	 *
	 * Try to take inspiration from Vanilla (Hearthstone by Blizzard), which describes enough for the user to know what the card does, without the nuances.
	 */
	text: string;
	/** How much the card should cost. This is normally in mana. */
	cost: number;
	/** The type of the card. For example; "Minion" / "Spell" / "Weapon", etc... */
	type: Type;
	/** The classes that the card belongs to. For example; ["Neutral"], ["Mage"], ["Paladin", "Rogue"] */
	classes: Class[];
	/** The rarity of the card. This doesn't really do much in this game since there isn't any lootbox mechanics here. Examples of rarities: "Legendary", "Epic", "Free", etc... */
	rarity: Rarity;
	/** The tags of the card. */
	tags: CardTag[];
	/** If the card should be allowed in decks / card pools. */
	collectible: boolean;
	/**
	 * The id of the card. This should be unique per blueprint as it differentiates blueprints from each other.
	 *
	 * This should be automatically generated by the card creator.
	 *
	 * You can find the latest id in `cards/.latestId`. If you want to set the id manually, increment the number by 1 (remember to save the file), and put the resulting id here. Example: `.latestId` says 5, increment it to 6, save the file, set the blueprint's id to 6.
	 */
	id: number;

	// Type specific
	/**
	 * ### This is required for Minions and Weapons
	 *
	 * The amount of attack that the card has.
	 */
	attack?: number;
	/**
	 * ### This is required for Minions and Weapons
	 *
	 * The amount of health that the card has.
	 */
	health?: number;
	/**
	 * ### This is required for Minions
	 *
	 * The tribes of the card. For example; "Beast", "Naga", "All", "None", etc...
	 */
	tribes?: MinionTribe[];

	/**
	 * ### This is required for Spells
	 *
	 * The schools of the spell. For example; "Fire", "Arcane", "Fel", etc...
	 */
	spellSchools?: SpellSchool[];

	/**
	 * ### This is required for Locations
	 *
	 * The amount of durability that the location card has.
	 *
	 * Every time a location card gets used, its durability is decreased by 1. When it reaches 0, the location card breaks.
	 */
	durability?: number;
	/**
	 * ### This is required for Locations
	 *
	 * The cooldown of the location card. Im pretty sure that, in vanilla, this number is always 2.
	 *
	 * Every time a location card gets used, its cooldown is set to this value. Every turn, the cooldown of the card gets decreased by 1 until it reaches 0, then it can be used.
	 */
	cooldown?: number;

	/**
	 * ### This is required for Heroes
	 *
	 * The amount of armor that the player should gain when playing the card.
	 */
	armor?: number;

	/**
	 * ### This is required for Heroes
	 *
	 * The id of the hero power card for the hero.
	 *
	 * The hero power card should be of type "Heropower", and its `heropower` ability will be triggered every time the player uses their hero power.
	 */
	heropowerId?: number;

	/**
	 * ### This is required for Enchantments
	 *
	 * The priority of the enchantment.
	 *
	 * A higher priority means that the enchantment will be applied before others. The order of the enchantments can affect the resulting card.
	 *
	 * For example, an enchantment setting a card's attack to 0 should be applied before ones that increase the cards attack.
	 * Otherwise, if the card has a +1 Attack and a Attack = 0 enchantment, the order of events can look like this: 3 -> 4 -> 0, which is not the intended effect. Instead it should look like: 3 -> 0 -> 1
	 */
	enchantmentPriority?: EnchantmentPriority;
}

export type BlueprintWithOptional = Blueprint & {
	runes?: string;
	keywords?: Keyword[];
};
