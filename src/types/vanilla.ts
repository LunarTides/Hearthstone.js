export type VanillaCardClass =
// 12410 Cards
| 'NEUTRAL'
// 1240 Cards
| 'DRUID'
// 1138 Cards
| 'WARRIOR'
// 1065 Cards
| 'WARLOCK'
// 1059 Cards
| 'ROGUE'
// 1057 Cards
| 'PALADIN'
// 1055 Cards
| 'MAGE'
// 1036 Cards
| 'HUNTER'
// 975 Cards
| 'SHAMAN'
// 905 Cards
| 'PRIEST'
// 556 Cards
| 'DEMONHUNTER'
// 355 Cards
| 'DEATHKNIGHT'
// 11 Cards
| 'DREAM'
// 2 Cards
| 'WHIZBANG';

export type VanillaCardRarity =
// 2766 Cards
| 'COMMON'
// 2103 Cards
| 'RARE'
// 1492 Cards
| 'EPIC'
// 1342 Cards
| 'LEGENDARY'
// 1009 Cards
| 'FREE';

export type VanillaCardSet =
// 7150 Cards
| 'LETTUCE'
// 2535 Cards
| 'BATTLEGROUNDS'
// 2225 Cards
| 'TB'
// 1079 Cards
| 'THE_BARRENS'
// 854 Cards
| 'THE_SUNKEN_CITY'
// 816 Cards
| 'DALARAN'
// 808 Cards
| 'ULDUM'
// 665 Cards
| 'ALTERAC_VALLEY'
// 641 Cards
| 'DARKMOON_FAIRE'
// 604 Cards
| 'STORMWIND'
// 559 Cards
| 'LOOTAPALOOZA'
// 528 Cards
| 'HERO_SKINS'
// 519 Cards
| 'GILNEAS'
// 512 Cards
| 'TITANS'
// 507 Cards
| 'VANILLA'
// 481 Cards
| 'TROLL'
// 451 Cards
| 'EXPERT1'
// 424 Cards
| 'RETURN_OF_THE_LICH_KING'
// 420 Cards
| 'SCHOLOMANCE'
// 419 Cards
| 'BOOMSDAY'
// 414 Cards
| 'BLACK_TEMPLE'
// 397 Cards
| 'REVENDRETH'
// 365 Cards
| 'CORE'
// 347 Cards
| 'BATTLE_OF_THE_BANDS'
// 318 Cards
| 'ICECROWN'
// 313 Cards
| 'LEGACY'
// 284 Cards
| 'YEAR_OF_THE_DRAGON'
// 273 Cards
| 'GANGS'
// 262 Cards
| 'LOE'
// 246 Cards
| 'DRAGONS'
// 234 Cards
| 'UNGORO'
// 231 Cards
| 'OG'
// 228 Cards
| 'BRM'
// 227 Cards
| 'KARA'
// 218 Cards
| 'CREDITS'
// 217 Cards
| 'WONDERS'
// 213 Cards
| 'TGT'
// 200 Cards
| 'GVG'
// 170 Cards
| 'NAXX'
// 138 Cards
| 'PLACEHOLDER_202204'
// 64 Cards
| 'MISSIONS'
// 60 Cards
| 'PATH_OF_ARTHAS'
// 49 Cards
| 'TAVERNS_OF_TIME'
// 36 Cards
| 'BASIC'
// 34 Cards
| 'DEMON_HUNTER_INITIATE';

export type VanillaCardType =
// 8497 Cards
| 'MINION'
// 5229 Cards
| 'ENCHANTMENT'
// 5227 Cards
| 'SPELL'
// 4438 Cards
| 'LETTUCE_ABILITY'
// 2186 Cards
| 'HERO'
// 1720 Cards
| 'HERO_POWER'
// 402 Cards
| 'WEAPON'
// 55 Cards
| 'BATTLEGROUNDS_QUEST_REWARD'
// 51 Cards
| 'BATTLEGROUNDS_ANOMALY'
// 35 Cards
| 'LOCATION'
// 9 Cards
| 'GAME_MODE_BUTTON'
// 3 Cards
| 'MOVE_MINION_HOVER_TARGET'
// 1 Card
| 'BATTLEGROUNDS_HERO_BUDDY';

export type VanillaSpellSchool =
// 710 Cards
| 'SHADOW'
// 687 Cards
| 'NATURE'
// 406 Cards
| 'FIRE'
// 370 Cards
| 'HOLY'
// 325 Cards
| 'ARCANE'
// 273 Cards
| 'FROST'
// 231 Cards
| 'FEL'
// 1 Card
| 'PHYSICAL_COMBAT';

export type VanillaReferenceTag =
// 657 Cards
| 'TAUNT'
// 399 Cards
| 'DEATHRATTLE'
// 295 Cards
| 'RUSH'
// 291 Cards
| 'BATTLECRY'
// 265 Cards
| 'DIVINE_SHIELD'
// 185 Cards
| 'IMMUNE'
// 180 Cards
| 'FREEZE'
// 129 Cards
| 'SECRET'
// 128 Cards
| 'DISCOVER'
// 123 Cards
| 'STEALTH'
// 103 Cards
| 'WINDFURY'
// 82 Cards
| 'SPELLPOWER'
// 69 Cards
| 'POISONOUS'
// 67 Cards
| 'LIFESTEAL'
// 58 Cards
| 'CHARGE'
// 56 Cards
| 'OVERLOAD'
// 46 Cards
| 'JADE_GOLEM'
// 44 Cards
| 'COMBO'
// 43 Cards
| 'REBORN'
// 42 Cards
| 'SILENCE'
// 30 Cards
| 'START_OF_GAME'
// 22 Cards
| 'ADAPT'
// 21 Cards
| 'OUTCAST'
// 18 Cards
| 'HONORABLEKILL'
// 18 Cards
| 'AUTOATTACK'
// 17 Cards
| 'RECRUIT'
// 15 Cards
| 'MAGNETIC'
// 15 Cards
| 'COUNTER'
// 10 Cards
| 'CHOOSE_ONE'
// 9 Cards
| 'SPARE_PART'
// 9 Cards
| 'TRADEABLE'
// 8 Cards
| 'FRENZY'
// 6 Cards
| 'QUEST'
// 6 Cards
| 'ENRAGED'
// 5 Cards
| 'VENOMOUS'
// 4 Cards
| 'AFFECTED_BY_SPELL_POWER'
// 3 Cards
| 'OVERHEAL'
// 3 Cards
| 'ECHO'
// 3 Cards
| 'CORRUPT'
// 3 Cards
| 'DREDGE'
// 3 Cards
| 'COLOSSAL'
// 2 Cards
| 'OVERKILL'
// 2 Cards
| 'TITAN'
// 2 Cards
| 'FORGE'
// 1 Card
| 'AI_MUST_PLAY'
// 1 Card
| 'CANT_ATTACK'
// 1 Card
| 'INFUSE'
// 1 Card
| 'SPELLBURST';

export type VanillaFaction =
// 247 Cards
| 'ALLIANCE'
// 150 Cards
| 'HORDE';

export type VanillaMultiClass =
// 12 Cards
| 'DRUID_SHAMAN'
// 10 Cards
| 'WARLOCK_DEMONHUNTER'
// 9 Cards
| 'HUNTER_DEMONHUNTER'
// 9 Cards
| 'PRIEST_WARLOCK'
// 9 Cards
| 'MAGE_SHAMAN'
// 9 Cards
| 'DRUID_HUNTER'
// 8 Cards
| 'MAGE_ROGUE'
// 8 Cards
| 'PALADIN_WARRIOR'
// 7 Cards
| 'ROGUE_WARRIOR'
// 6 Cards
| 'JADE_LOTUS'
// 5 Cards
| 'GRIMY_GOONS'
// 5 Cards
| 'PALADIN_PRIEST'
// 4 Cards
| 'KABAL'
// 4 Cards
| 'PRIEST_DRUID'
// 2 Cards
| 'MAGE_HUNTER'
// 2 Cards
| 'HUNTER_DEATHKNIGHT'
// 2 Cards
| 'DEATHKNIGHT_PALADIN'
// 2 Cards
| 'PALADIN_SHAMAN'
// 2 Cards
| 'SHAMAN_WARRIOR'
// 2 Cards
| 'WARRIOR_DEMONHUNTER'
// 2 Cards
| 'DEMONHUNTER_ROGUE'
// 2 Cards
| 'ROGUE_PRIEST'
// 2 Cards
| 'DRUID_WARLOCK'
// 2 Cards
| 'WARLOCK_MAGE';

export type VanillaCardMechanic =
// 2605 Cards
| 'TRIGGER_VISUAL'
// 2278 Cards
| 'BATTLECRY'
// 1003 Cards
| 'DEATHRATTLE'
// 853 Cards
| 'TAUNT'
// 406 Cards
| 'AURA'
// 391 Cards
| 'ENCHANTMENT_INVISIBLE'
// 390 Cards
| 'RUSH'
// 366 Cards
| 'DISCOVER'
// 335 Cards
| 'TAG_ONE_TURN_EFFECT'
// 228 Cards
| 'DUNGEON_PASSIVE_BUFF'
// 203 Cards
| 'AI_MUST_PLAY'
// 154 Cards
| 'DIVINE_SHIELD'
// 154 Cards
| 'LIFESTEAL'
// 145 Cards
| 'CHOOSE_ONE'
// 134 Cards
| 'AFFECTED_BY_SPELL_POWER'
// 133 Cards
| 'SECRET'
// 119 Cards
| 'STEALTH'
// 119 Cards
// Idk why the capitalization is this way
| 'ImmuneToSpellpower'
// 118 Cards
| 'UNTOUCHABLE'
// 103 Cards
| 'MAGNETIC'
// 100 Cards
| 'COMBO'
// 96 Cards
| 'CANT_BE_SILENCED'
// 94 Cards
| 'CHARGE'
// 91 Cards
| 'SPELLPOWER'
// 88 Cards
| 'WINDFURY'
// 83 Cards
| 'OVERLOAD'
// 82 Cards
| 'POISONOUS'
// 70 Cards
| 'REBORN'
// 60 Cards
| 'InvisibleDeathrattle'
// 59 Cards
| 'START_OF_GAME'
// 58 Cards
| 'TOPDECK'
// 55 Cards
| 'CANT_ATTACK'
// 55 Cards
| 'FREEZE'
// 46 Cards
| 'SPELLBURST'
// 45 Cards
| 'TWINSPELL'
// 45 Cards
| 'AVENGE'
// 45 Cards
| 'QUEST'
// 39 Cards
| 'OUTCAST'
// 37 Cards
| 'CANT_BE_TARGETED_BY_SPELLS'
// 37 Cards
| 'CANT_BE_TARGETED_BY_HERO_POWERS'
// 36 Cards
| 'TRADEABLE'
// 36 Cards
| 'CORRUPT'
// 34 Cards
| 'DREDGE'
// 33 Cards
| 'OVERKILL'
// 31 Cards
| 'INSPIRE'
// 31 Cards
| 'HONORABLEKILL'
// 30 Cards
| 'ENRAGED'
// 29 Cards
| 'INFUSE'
// 27 Cards
| 'FRENZY'
// 23 Cards
| 'ECHO'
// 21 Cards
| 'MANATHIRST'
// 19 Cards
| 'FORGE'
// 18 Cards
| 'VENOMOUS'
// 17 Cards
| 'ADJACENT_BUFF'
// 17 Cards
| 'SILENCE'
// 15 Cards
| 'COLOSSAL'
// 14 Cards
| 'PUZZLE'
// 14 Cards
| 'APPEAR_FUNCTIONALLY_DEAD'
// 14 Cards
| 'EVIL_GLOW'
// 12 Cards
| 'TITAN'
// 11 Cards
| 'SIDEQUEST'
// 11 Cards
| 'MULTIPLY_BUFF_VALUE'
// 11 Cards
| 'SPARE_PART'
// 9 Cards
| 'OVERHEAL'
// 9 Cards
| 'IMMUNE'
// 7 Cards
| 'FORGETFUL'
// 6 Cards
| 'JADE_LOTUS'
// 5 Cards
| 'GRIMY_GOONS'
// 4 Cards
| 'HEROPOWER_DAMAGE'
// 4 Cards
| 'GEARS'
// 4 Cards
| 'KABAL'
// 4 Cards
| 'JADE_GOLEM'
// 3 Cards
| 'RECEIVES_DOUBLE_SPELLDAMAGE_BONUS'
// 3 Cards
| 'DEATH_KNIGHT'
// 3 Cards
| 'MORPH'
// 3 Cards
| 'IGNORE_HIDE_STATS_FOR_BIG_CARD'
// 3 Cards
| 'GHOSTLY'
// 3 Cards
| 'CANT_BE_DESTROYED'
// 2 Cards
| 'FINISH_ATTACK_SPELL_ON_DAMAGE'
// 2 Cards
| 'SUMMONED'
// 2 Cards
| 'CANT_BE_FATIGUED'
// 2 Cards
| 'AUTOATTACK'
// 1 Card, probably Genn Greymane
| 'COLLECTIONMANAGER_FILTER_MANA_EVEN'
// 1 Card, probably Baku the Mooneater
| 'COLLECTIONMANAGER_FILTER_MANA_ODD'
// 1 Card
| 'COUNTER';

/**
 * Vanilla Hearthstone's card blueprint.
 */
export type VanillaCard = {
    id: string;
    dbfId: number;
    name: string;
    text?: string;
    flavor?: string;
    artist?: string;
    cardClass?: VanillaCardClass;
    collectible?: boolean;
    cost?: number;
    mechanics?: VanillaCardMechanic[];
    rarity?: VanillaCardRarity;
    set: VanillaCardSet;
    race?: VanillaCardType;
    races?: VanillaCardType[];
    type: VanillaCardType;
    spellSchool?: VanillaSpellSchool;
    durability?: number;
    faction?: VanillaFaction;
    elite?: boolean;
    attack?: number;
    health?: number;

    howToEarn?: string;
    // All props below this line was found by the vcpropfinder
    classes?: VanillaCardClass[];
    heroPowerDbfId?: number;
    referencesTags?: VanillaReferenceTag[];
    targetingArrowText?: string;
    overload?: number;
    spellDamage?: number;
    collectionText?: string;
    hasDiamondSkin?: boolean;
    howToEarnGolden?: string;
    armor?: number;
    multiClassGroup?: VanillaMultiClass;
    isMiniSet?: boolean;
    questReward?: string;

    // Likely part of other gamemodes. Useless for this game
    mercenariesRole?: string;
    mercenariesAbilityCooldown?: number;
    techLevel?: number;
    hideCost?: boolean;
    hideStats?: boolean;
    isBattlegroundsPoolMinion?: boolean;
    battlegroundsPremiumDbfId?: number;
    battlegroundsNormalDbfId?: number;
    battlegroundsBuddyDbfId?: number;
    battlegroundsHero?: boolean;
    isBattlegroundsBuddy?: boolean;
    battlegroundsSkinParentId?: number;
    battlegroundsDarkmoonPrizeTurn?: number;
    countAsCopyOfDbfId?: number;
    puzzleType?: number;
};
