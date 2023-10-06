/**
 * Types
 * @module Types
 */
import { Card, Player } from "./internal.js";

/**
 * Ai scored card
 */
export type ScoredCard = {
    card: Card,
    score: number
}

/**
 * The type of the card.
 */
export type CardType =
| "Minion"
| "Spell"
| "Weapon"
| "Hero"
| "Location"
| "Undefined";

/**
 * The class that the card belongs to. (without "Neutral")
 */
export type CardClassNoNeutral =
| "Death Knight"
| "Demon Hunter"
| "Druid"
| "Hunter"
| "Mage"
| "Paladin"
| "Priest"
| "Rogue"
| "Shaman"
| "Warlock"
| "Warrior";


/**
 * The class that the card belongs to.
 */
export type CardClass = CardClassNoNeutral | "Neutral";

/**
 * The rarity of the card.
 */
export type CardRarity = 
| "Free"
| "Common"
| "Rare"
| "Epic"
| "Legendary";

/**
 * What the card costs.
 */
export type CostType =
| "mana"
| "armor"
| "health";

/**
 * The school of the spell.
 */
export type SpellSchool =
| "Arcane"
| "Fel"
| "Fire"
| "Frost"
| "Holy"
| "Nature"
| "Shadow"
| "None";

/**
 * The tribe of the minion.
 */
export type MinionTribe =
| "Beast"
| "Demon"
| "Dragon"
| "Elemental"
| "Mech"
| "Murloc"
| "Naga"
| "Pirate"
| "Quilboar"
| "Totem"
| "Undead"
| "All"
| "None";

/**
 * Card keywords.
 */
export type CardKeyword =
| "Divine Shield"
| "Dormant"
| "Lifesteal"
| "Poisonous"
| "Reborn"
| "Rush"
| "Stealth"
| "Taunt"
| "Tradeable"
| "Windfury"
| "Outcast"
| "Cast On Draw"
| "Charge"
| "Mega-Windfury"
| "Echo"
| "Magnetic"
| "Twinspell"
| "Elusive"
| "Cleave";

/**
 * Card abilities that is from vanilla Hearthstone.
 */
export type CardAbilityReal =
| "adapt"
| "battlecry"
| "cast"
| "combo"
| "deathrattle"
| "finale"
| "frenzy"
| "heropower"
| "honorablekill"
| "infuse"
| "inspire"
| "invoke"
| "outcast"
| "overheal"
| "overkill"
| "passive"
| "spellburst"
| "startofgame"
| "use";

/**
 * All Card abilities.
 */
export type CardAbility =
| CardAbilityReal
| "placeholders"
| "condition"
| "remove"
| "handpassive"
| "tick"
| "handtick"
| "test"
| "create";

export type UnknownEventValue = EventValue<EventKey>;

/**
 * Game.PlayCard return value
 */
export type GamePlayCardReturn =
| true
| "cost"
| "traded"
| "space"
| "magnetize"
| "colossal"
| "refund"
| "counter"
| "invalid";

/**
 * Attack return value
 */
export type GameAttackReturn =
| true
| "divineshield"
| "taunt"
| "stealth"
| "frozen"
| "plrnoattack"
| "noattack"
| "plrhasattacked"
| "hasattacked"
| "sleepy"
| "cantattackhero"
| "immune"
| "dormant"
| "invalid";

/**
 * ExportDeck error return value
 */
export type FunctionsExportDeckError = null | { msg: string; info: null | { card?: CardLike, amount?: number }; recoverable: boolean; }; 

/**
 * CalcMove return value
 */
export type AICalcMoveOption =
| Card
| "hero power"
| "attack"
| "use"
| "end";

/**
 * SelectTarget alignment
 */
export type SelectTargetAlignment = "friendly" | "enemy" | "any";
/**
 * SelectTarget class
 */
export type SelectTargetClass = "hero" | "minion" | "any";
/**
 * SelectTarget flags
 */
export type SelectTargetFlag = "allowLocations" | "forceElusive";

/**
 * GameConstants values.
 */
export type GameConstants = {
    REFUND: -1
}

/**
 * The quest callback used in card blueprints.
 */
export type QuestCallback = (val: UnknownEventValue, done: boolean) => boolean;

/**
 * The backend of a quest.
 */
export type QuestType = {
    name: string,
    progress: [number, number],
    key: EventKey,
    value: number,
    callback: QuestCallback,
    next?: string
};

/**
 * Vanilla Hearthstone's card blueprint.
 */
export type VanillaCard = {
    id: string,
    dbfId: number,
    name: string,
    text?: string,
    flavor?: string,
    artist?: string,
    cardClass?: CardClass,
    collectible?: boolean,
    cost?: number,
    mechanics?: string[],
    rarity?: CardRarity,
    set: string,
    race?: CardType,
    races?: CardType[],
    type: CardType,
    spellSchool?: SpellSchool,
    durability?: number,
    faction?: string,
    elite?: boolean,
    attack?: number,
    health?: number,

    howToEarn?: string,
    // All props below this line was found by the vcpropfinder
    classes?: CardClass[]
    heroPowerDbfId?: number,
    referencesTags?: string[],
    targetingArrowText?: string,
    overload?: number,
    spellDamage?: number,
    collectionText?: string,
    hasDiamondSkin?: boolean,
    howToEarnGolden?: string,
    armor?: number,
    multiClassGroup?: string,
    isMiniSet?: boolean,
    questReward?: string,

    // Likely part of other gamemodes. Useless for this game
    mercenariesRole?: string,
    mercenariesAbilityCooldown?: number,
    techLevel?: number,
    hideCost?: boolean,
    hideStats?: boolean,
    isBattlegroundsPoolMinion?: boolean,
    battlegroundsPremiumDbfId?: number,
    battlegroundsNormalDbfId?: number,
    battlegroundsBuddyDbfId?: number,
    battlegroundsHero?: boolean,
    isBattlegroundsBuddy?: boolean,
    battlegroundsSkinParentId?: number,
    battlegroundsDarkmoonPrizeTurn?: number,
    countAsCopyOfDbfId?: number,
    puzzleType?: number,
};

/**
 * A backup of a card.
 */
export type CardBackup = {
    [key in keyof Card]: Card[key];
}

/**
 * The abilities that a blueprint can have. (From CardAbility)
 */
type BlueprintAbilities = {
    [Property in CardAbility]?: Ability;
}

/**
 * The blueprint of a card.
 */
export type Blueprint = {
    // Common
    name: string,
    displayName?: string,
    stats?: number[],
    text: string,
    cost: number,
    type: CardType,

    // Type specific
    tribe?: MinionTribe, 
    spellSchool?: SpellSchool,
    durability?: number,
    cooldown?: number,
    hpText?: string,
    hpCost?: number,

    // Less important
    classes: CardClass[],
    rarity: CardRarity,

    // Last
    uncollectible?: boolean,
    id: number
} & BlueprintAbilities;

export type BlueprintWithOptional = Blueprint & {
    runes?: string,
    keywords?: CardKeyword[],
}

/**
 * The ability of a card.
 */
export type Ability = (plr: Player, self: Card, key?: EventKey, val?: UnknownEventValue, eventPlayer?: Player) => any;

/**
 * The event listener callback return value.
 */
export type EventListenerMsg = boolean | "destroy" | "reset";
/**
 * The event listener callback function.
 */
export type EventListenerCallback = (val: UnknownEventValue, eventPlayer: Player) => EventListenerMsg;

export type HistoryKey = [EventKey, UnknownEventValue, Player];

/**
 * A card-like object.
 */
export type CardLike = Card | Blueprint;
/**
 * A target.
 */
export type Target = Card | Player;

/**
 * Callback for tick hooks. Used in hookToTick.
 */
export type TickHookCallback = (key: EventKey, val: UnknownEventValue, eventPlayer: Player) => void;

/**
 * AI history object.
 */
export type AIHistory = {
    type: string,
    data: any
}

/**
 * Card Enchantment object.
 */
export type EnchantmentDefinition = {
    enchantment: string,
    owner: Card
}

/**
 * Game events.
 */
export type EventManagerEvents = {[key in EventKey]?: [[[any, number]], [[any, number]]]};

/**
 * Game configuration.
 */
export type GameConfig = {
    general: {
        debug: boolean,
        editor: string,
        topicBranchWarning: boolean,
        maxBoardSpace: number
    }

    decks: {
        validate: boolean,
        minLength: number,
        maxLength: number,
        maxOfOneCard: number,
        maxOfOneLegendary: number,
    }

    ai: {
        player1: boolean,
        player2: boolean,

        contextAnalysis: boolean,
        attackModel: number,
        mulliganThreshold: number
        tradeThreshold: number,
        statsBias: number
        costBias: number
        spellValue: number,
        keywordValue: number
        abilityValue: number,

        protectThreshold: number,
        ignoreThreshold: number,
        riskThreshold: number,

        sentiments: {
            positive: {[key: string]: number},
            negative: {[key: string]: number}
        }
    }

    advanced: {
        dcShowUncollectible: boolean,
        reloadCommandConfirmation: boolean,
        reloadCommandRecompile: boolean,
        getReadableCardMaxDepth: number,
        getReadableCardNoRecursion: boolean,
        getReadableCardAlwaysShowFullCard: boolean,

        whitelistedHistoryKeys: EventKey[],
        hideValueHistoryKeys: EventKey[],
    }

    info: {
        version: string,
        branch: "stable" | "beta" | "alpha" | "topic",
        build: number,

        versionText: string,

        stableIntroText: string,
        betaIntroText: string,
        alphaIntroText: string,
        topicIntroText: string,
    }

    todo: {[name: string]: {
        state: "not done" | "doing" | "done" | "first pass" | "second pass" | "third pass",
        description: string
    }}
}

/**
 * Event keys
 */
export type EventKey =
| "FatalDamage"
| "EndTurn"
| "StartTurn"
| "HealthRestored"
| "UnspentMana"
| "GainOverload"
| "GainHeroAttack"
| "TakeDamage"
| "PlayCard"
| "PlayCardUnsafe"
| "SummonMinion"
| "KillMinion"
| "DamageMinion"
| "CancelCard"
| "CastSpellOnMinion"
| "TradeCard"
| "FreezeCard"
| "CreateCard"
| "AddCardToDeck"
| "AddCardToHand"
| "DrawCard"
| "SpellDealsDamage"
| "Attack"
| "HeroPower"
| "TargetSelectionStarts"
| "TargetSelected"
| "Dummy"
| "Eval"
| "Input"
| "GameLoop";

/**
 * Event values
 */
export type EventValue<Key extends EventKey> =
    /**
     * This is always null. 
     */
    Key extends "FatalDamage" ? null : 
    /**
     * The current turn (before turn counter increment)
     */
    Key extends "EndTurn" ? number : 
    /**
     * The current turn (after turn counter increment)
     */
    Key extends "StartTurn" ? number : 
    /**
     * The amount of health after restore
     */
    Key extends "HealthRestored" ? number : 
    /**
     * The amount of mana the player has left
     */
    Key extends "UnspentMana" ? number : 
    /**
     * The amount of overload gained
     */
    Key extends "GainOverload" ? number : 
    /**
     * The amount of hero attack gained
     */
    Key extends "GainHeroAttack" ? number : 
    /**
     * The player that was dealt the damage, The amount of damage taken
     */
    Key extends "TakeDamage" ? [Player, number] : 
    /**
     * The card that was played. (This gets triggered after the text of the card)
     */
    Key extends "PlayCard" ? Card : 
    /**
     * The card that was played. (This gets triggered before the text of the card, which means it also gets triggered before the cancelling logic. So you have to handle cards being cancelled.)
     */
    Key extends "PlayCardUnsafe" ? Card : 
    /**
     * The minion that was summoned
     */
    Key extends "SummonMinion" ? Card : 
    /**
     * The minion that was killed
     */
    Key extends "KillMinion" ? Card : 
    /**
     * The minion that was damaged, and the amount of damage
     */
    Key extends "DamageMinion" ? [Card, number] : 
    /**
     * The card that was cancelled, and the ability that was cancelled
     */
    Key extends "CancelCard" ? [Card, CardAbility] : 
    /**
     * The spell that was cast, and the target
     */
    Key extends "CastSpellOnMinion" ? [Card, Card] : 
    /**
     * The card that was traded
     */
    Key extends "TradeCard" ? Card : 
    /**
     * The card that was frozen
     */
    Key extends "FreezeCard" ? Card : 
    /**
     * The card that was created
     */
    Key extends "CreateCard" ? Card : 
    /**
     * The card that was added to the deck
     */
    Key extends "AddCardToDeck" ? Card : 
    /**
     * The card that was added to the hand
     */
    Key extends "AddCardToHand" ? Card : 
    /**
     * The card that was drawn
     */
    Key extends "DrawCard" ? Card : 
    /**
     * The target, and the amount of damage
     */
    Key extends "SpellDealsDamage" ? [Target, number] : 
    /**
     * The attacker, and the target
     */
    Key extends "Attack" ? [Target, Target] : 
    /**
     * The class of the hero power. (Warrior, Mage, Priest, ...)
     */
    Key extends "HeroPower" ? string : 
    /**
     * The code to evaluate
     */
    Key extends "Eval" ? string : 
    /**
     * The input
     */
    Key extends "Input" ? string : 
    /**
     * The prompt, the card that requested target selection, the alignment that the target should be, the class of the target (hero | minion), and the flags (if any).
     */
    Key extends "TargetSelectionStarts" ? [string, Card | null, SelectTargetAlignment, SelectTargetClass, SelectTargetFlag[]] : 
    /**
     * The card that requested target selection, and the target
     */
    Key extends "TargetSelected" ? [Card | null, Target] : 
    never;
