import {type Card, type Player} from '@Game/internal.js';
import {type CardAbility, type CardType, type MinionTribe, type SpellSchool, type CardClass, type CardRarity, type CardKeyword} from './card.js';
import {type EventKey, type UnknownEventValue} from './event.js';

/**
 * The ability of a card.
 */
export type Ability = (plr: Player, self: Card, key?: EventKey, value?: UnknownEventValue, eventPlayer?: Player) => any;

/**
 * The abilities that a blueprint can have. (From CardAbility)
 */
type BlueprintAbilities = {
	[Property in CardAbility]?: Ability;
};

/**
 * The blueprint of a card.
 */
export type Blueprint = {
	// Common
	name: string;
	displayName?: string;
	stats?: number[];
	text: string;
	cost: number;
	type: CardType;

	// Type specific
	tribe?: MinionTribe;
	spellSchool?: SpellSchool;
	durability?: number;
	cooldown?: number;
	hpText?: string;
	hpCost?: number;

	// Less important
	classes: CardClass[];
	rarity: CardRarity;

	// Last
	uncollectible?: boolean;
	id: number;
} & BlueprintAbilities;

export type BlueprintWithOptional = Blueprint & {
	runes?: string;
	keywords?: CardKeyword[];
};
