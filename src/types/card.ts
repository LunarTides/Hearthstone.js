import {type Card} from '@Game/internal.js';

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

| 'Cleave';

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
| 'heropower'
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
