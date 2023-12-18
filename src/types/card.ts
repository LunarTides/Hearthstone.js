import { type Player, type Card } from '@Game/internal.js';
import { type EventKey, type UnknownEventValue } from '@Game/types.js';

/**
 * Ai scored card
 */
export type ScoredCard = {
    card: Card;
    score: number;
};

/**
 * The type of the card.
 */
export type CardType =
| 'Minion'
| 'Spell'
| 'Weapon'
| 'Hero'
| 'Location'
| 'Undefined';

/**
 * The class that the card belongs to. (without "Neutral")
 */
export type CardClassNoNeutral =
| 'Death Knight'
| 'Demon Hunter'
| 'Druid'
| 'Hunter'
| 'Mage'
| 'Paladin'
| 'Priest'
| 'Rogue'
| 'Shaman'
| 'Warlock'
| 'Warrior';

/**
 * The class that the card belongs to.
 */
export type CardClass = CardClassNoNeutral | 'Neutral';

/**
 * The rarity of the card.
 */
export type CardRarity =
| 'Free'
| 'Common'
| 'Rare'
| 'Epic'
| 'Legendary';

/**
 * What the card costs.
 */
export type CostType =
| 'mana'
| 'armor'
| 'health';

/**
 * The school of the spell.
 */
export type SpellSchool =
| 'Arcane'
| 'Fel'
| 'Fire'
| 'Frost'
| 'Holy'
| 'Nature'
| 'Shadow'
| 'None';

/**
 * The tribe of the minion.
 */
export type MinionTribe =
| 'Beast'
| 'Demon'
| 'Dragon'
| 'Elemental'
| 'Mech'
| 'Murloc'
| 'Naga'
| 'Pirate'
| 'Quilboar'
| 'Totem'
| 'Undead'
| 'All'
| 'None';

/**
 * Card keywords.
 */
export type CardKeyword =
| 'Divine Shield'
| 'Dormant'
| 'Lifesteal'
| 'Poisonous'
| 'Reborn'
| 'Rush'
| 'Stealth'
| 'Taunt'
| 'Tradeable'
| 'Forge'
| 'Windfury'
| 'Outcast'
| 'Cast On Draw'
| 'Charge'
| 'Mega-Windfury'
| 'Echo'
| 'Magnetic'
| 'Twinspell'
| 'Elusive'
| 'Frozen'
| 'Immune'
| 'Corrupt'
| 'Colossal'
| 'Infuse'
| 'Cleave'
| 'Titan';

/**
 * Card abilities that is from vanilla Hearthstone.
 */
export type CardAbilityReal =
| 'adapt'
| 'battlecry'
| 'cast'
| 'combo'
| 'deathrattle'
| 'finale'
| 'frenzy'
| 'honorablekill'
| 'infuse'
| 'inspire'
| 'invoke'
| 'outcast'
| 'overheal'
| 'overkill'
| 'passive'
| 'spellburst'
| 'startofgame'
| 'use';

/**
 * All Card abilities.
 */
export type CardAbility =
| CardAbilityReal
| 'placeholders'
| 'condition'
| 'remove'
| 'handpassive'
| 'tick'
| 'handtick'
| 'test'
| 'create';

/**
 * Card Enchantment object.
 */
export type EnchantmentDefinition = {
    enchantment: string;
    owner: Card;
};

/**
 * A backup of a card.
 */
export type CardBackup = {
    [key in keyof Card]: Card[key];
};

/**
 * The ability of a card.
 */
export type Ability = (plr: Player, self: Card, key?: EventKey, _unknownValue?: UnknownEventValue, eventPlayer?: Player) => any;

/**
 * The abilities that a blueprint can have. (From CardAbility)
 */
type BlueprintAbilities = {
    [Property in CardAbility]?: Ability;
};

/**
 * The blueprint of a card.
 *
 * If a field doesn't have:
 * ### This is required for Xs and Ys
 * Then it is required by every card.
 */
export type Blueprint = {
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
    type: CardType;
    /** The classes that the card belongs to. For example; ["Neutral"], ["Mage"], ["Paladin", "Rogue"] */
    classes: CardClass[];
    /** The rarity of the card. This doesn't really do much in this game since there isn't any lootbox mechanics here. Examples of rarities: "Legendary", "Epic", "Free", etc... */
    rarity: CardRarity;
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
     * The tribe of the card. For example; "Beast", "Naga", "All", "None", etc...
     */
    tribe?: MinionTribe;

    /**
     * ### This is required for Spells
     *
     * The school of the spell. For example; "Fire", "Arcane", "Fel", etc...
     */
    spellSchool?: SpellSchool;

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
     * The id of the hero power card for the hero.
     *
     * The hero power card should be a spell, and its `cast` ability will be triggered every time the player uses their hero power.
     */
    heropowerId?: number;
} & BlueprintAbilities;

export type BlueprintWithOptional = Blueprint & {
    runes?: string;
    keywords?: CardKeyword[];
};
