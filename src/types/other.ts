import {type Card, type Player} from '@Game/internal.js';
import {type Blueprint} from './blueprint.js';
import {type CardClass, type CardRarity, type CardType, type SpellSchool} from './card.js';
import {type EventKey} from './event.js';

/**
 * Game.PlayCard return value
 */
export type GamePlayCardReturn =
| true
| 'cost'
| 'traded'
| 'forged'
| 'space'
| 'magnetize'
| 'colossal'
| 'refund'
| 'counter'
| 'invalid';

/**
 * Attack return value
 */
export type GameAttackReturn =
| true
| 'divineshield'
| 'taunt'
| 'stealth'
| 'frozen'
| 'plrnoattack'
| 'noattack'
| 'plrhasattacked'
| 'hasattacked'
| 'sleepy'
| 'cantattackhero'
| 'immune'
| 'dormant'
| 'invalid';

/**
 * ExportDeck error return value
 */
export type FunctionsExportDeckError = undefined | {msg: string; info: undefined | {card?: CardLike; amount?: number}; recoverable: boolean};

/**
 * CalcMove return value
 */
export type AiCalcMoveOption =
| Card
| 'hero power'
| 'attack'
| 'use'
| 'end';

/**
 * SelectTarget alignment
 */
export type SelectTargetAlignment = 'friendly' | 'enemy' | 'any';
/**
 * SelectTarget class
 */
export type SelectTargetClass = 'hero' | 'minion' | 'any';
/**
 * SelectTarget flags
 */
export type SelectTargetFlag = 'allowLocations' | 'forceElusive';

/**
 * GameConstants values.
 */
export type GameConstants = {
    refund: -1;
};

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
    cardClass?: CardClass;
    collectible?: boolean;
    cost?: number;
    mechanics?: string[];
    rarity?: CardRarity;
    set: string;
    race?: CardType;
    races?: CardType[];
    type: CardType;
    spellSchool?: SpellSchool;
    durability?: number;
    faction?: string;
    elite?: boolean;
    attack?: number;
    health?: number;

    howToEarn?: string;
    // All props below this line was found by the vcpropfinder
    classes?: CardClass[];
    heroPowerDbfId?: number;
    referencesTags?: string[];
    targetingArrowText?: string;
    overload?: number;
    spellDamage?: number;
    collectionText?: string;
    hasDiamondSkin?: boolean;
    howToEarnGolden?: string;
    armor?: number;
    multiClassGroup?: string;
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

/**
 * A card-like object.
 */
export type CardLike = Card | Blueprint;
/**
 * A target.
 */
export type Target = Card | Player;

/**
 * AI history object.
 */
export type AiHistory = {
    type: string;
    data: any;
};

/**
 * Game configuration.
 */
export type GameConfig = {
    general: {
        debug: boolean;
        editor: string;
        topicBranchWarning: boolean;
        maxBoardSpace: number;
        maxHandLength: number;
    };

    decks: {
        validate: boolean;
        minLength: number;
        maxLength: number;
        maxOfOneCard: number;
        maxOfOneLegendary: number;
    };

    ai: {
        player1: boolean;
        player2: boolean;

        contextAnalysis: boolean;
        attackModel: number;
        mulliganThreshold: number;
        tradeThreshold: number;
        statsBias: number;
        costBias: number;
        spellValue: number;
        keywordValue: number;
        abilityValue: number;

        protectThreshold: number;
        ignoreThreshold: number;
        riskThreshold: number;

        sentiments: {
            positive: Record<string, number>;
            negative: Record<string, number>;
        };
    };

    advanced: {
        spawnInDiyCards: boolean;
        diyCardSpawnChance: number;
        dcShowUncollectible: boolean;
        reloadCommandConfirmation: boolean;
        reloadCommandRecompile: boolean;
        getReadableCardMaxDepth: number;
        getReadableCardNoRecursion: boolean;
        getReadableCardAlwaysShowFullCard: boolean;

        whitelistedHistoryKeys: EventKey[];
        hideValueHistoryKeys: EventKey[];
    };

    info: {
        version: string;
        branch: 'stable' | 'beta' | 'alpha' | 'topic';
        build: number;

        versionText: string;

        stableIntroText: string;
        betaIntroText: string;
        alphaIntroText: string;
        topicIntroText: string;
    };

    todo: Record<string, {
        state: 'not done' | 'doing' | 'done' | 'first pass' | 'second pass' | 'third pass';
        description: string;
    }>;
};
