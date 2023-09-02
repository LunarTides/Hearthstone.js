import { Card, Game, Player } from "./internal.js";

/**
 * Ai scored card
 */
export type ScoredCard = {
    card: Card,
    score: number,
}

/**
 * The type of the card
 */
export type CardType = "Minion" |
                       "Spell" |
                       "Weapon" |
                       "Hero" |
                       "Location" |
                       "Undefined";

/**
 * The class that the card belongs to
 */
export type CardClassNoNeutral = "Death Knight" |
                                 "Demon Hunter" |
                                 "Druid" |
                                 "Hunter" |
                                 "Mage" |
                                 "Paladin" |
                                 "Priest" |
                                 "Rogue" |
                                 "Shaman" |
                                 "Warlock" |
                                 "Warrior";

export type CardClass = CardClassNoNeutral | "Neutral";

/**
 * The rarity of the card
 */
export type CardRarity = "Free" |
                         "Common" |
                         "Rare" |
                         "Epic" |
                         "Legendary";

/**
 * What the card costs
 */
export type CostType = "mana" |
                       "armor" |
                       "health";

/**
 * The school of the spell
 */
export type SpellSchool = "Arcane" |
                          "Fel" |
                          "Fire" |
                          "Frost" | "Holy" | "Nature" | "Shadow" | "General";

/**
 * The tribe of the minion
 */
export type MinionTribe = "Beast" |
                          "Demon" |
                          "Dragon" |
                          "Elemental" |
                          "Mech" |
                          "Murloc" |
                          "Naga" |
                          "Pirate" |
                          "Quilboar" |
                          "Totem" |
                          "Undead" |
                          "All" |
                          "None";

/**
 * Card keywords
 */
export type CardKeyword = "Divine Shield" |
                          "Dormant" |
                          "Lifesteal" |
                          "Poisonous" |
                          "Reborn" |
                          "Rush" |
                          "Stealth" |
                          "Taunt" |
                          "Tradeable" |
                          "Windfury" |
                          "Outcast" |
                          "Cast On Draw" |
                          "Charge" |
                          "Mega-Windfury" |
                          "Echo" |
                          "Magnetic" |
                          "Twinspell" |
                          "Elusive" |
                          "Cleave";

export type CardAbilityReal = "adapt" |
                              "battlecry" |
                              "cast" |
                              "combo" |
                              "deathrattle" |
                              "finale" |
                              "frenzy" |
                              "heropower" |
                              "honorablekill" |
                              "infuse" |
                              "inspire" |
                              "invoke" |
                              "outcast" |
                              "overheal" |
                              "overkill" |
                              "passive" |
                              "spellburst" |
                              "startofgame" |
                              "use";

/**
 * Card abilities
 */
export type CardAbility = CardAbilityReal |
                          "placeholders" |
                          "condition" |
                          "unpassive" |
                          "handpassive";

/**
 * Event keys
 */
export type EventKey = "FatalDamage" |
                       "EndTurn" |
                       "StartTurn" |
                       "HealthRestored" |
                       "UnspentMana" |
                       "GainOverload" |
                       "GainHeroAttack" |
                       "TakeDamage" |
                       "PlayCard" |
                       "PlayCardUnsafe" |
                       "SummonMinion" |
                       "KillMinion" |
                       "DamageMinion" |
                       "CancelCard" |
                       "CastSpellOnMinion" |
                       "TradeCard" |
                       "FreezeCard" |
                       "CreateCard" |
                       "AddCardToDeck" |
                       "AddCardToHand" |
                       "DrawCard" |
                       "SpellDealsDamage" |
                       "Attack" |
                       "HeroPower" |
                       "TargetSelectionStarts" |
                       "TargetSelected" |
                       "Dummy" |
                       "Eval" |
                       "Input" |
                       "GameLoop";

/**
 * Event values
 */
export type EventValue<Key extends EventKey> = /**
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
                                                * The amount of damage taken
                                                */
                                               Key extends "TakeDamage" ? number : 
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
                                               Key extends "TargetSelectionStarts" ? [string, Card | null, SelectTargetAlignment | null, SelectTargetClass | null, SelectTargetFlag[]] : 
                                               /**
                                                * The card that requested target selection, and the target
                                                */
                                               Key extends "TargetSelected" ? [Card | null, Target] : 
                                               never;

/**
 * `Game.playCard` return value
 */
export type GamePlayCardReturn = Card |
                                 true |
                                 "mana" |
                                 "traded" |
                                 "space" |
                                 "magnetize" |
                                 "colossal" |
                                 "refund" |
                                 "counter" |
                                 "invalid";

/**
 * `Game.attack` return value
 */
export type GameAttackReturn = true |
                               "divineshield" |
                               "taunt" |
                               "stealth" |
                               "frozen" |
                               "plrnoattack" |
                               "noattack" |
                               "plrhasattacked" |
                               "hasattacked" |
                               "sleepy" |
                               "cantattackhero" |
                               "immune" |
                               "dormant" |
                               "invalid";

/**
 * `Functions.validateCard` return value
 */
export type FunctionsValidateCardReturn = boolean |
                                          "class" |
                                          "uncollectible" |
                                          "runes";

export type FunctionsExportDeckError = null | { msg: string; info: null | { card?: CardLike, amount?: number }; recoverable: boolean; }; 

/**
 * `AI.calcMove` return value
 */
export type AICalcMoveOption = Card |
                               "hero power" |
                               "attack" |
                               "use" |
                               "end";

/**
 * `Interact.selectTarget` alignment
 */
export type SelectTargetAlignment = "friendly" | "enemy";
/**
 * `Interact.selectTarget` class
 */
export type SelectTargetClass = "hero" | "minion";
/**
 * `Interact.selectTarget` flags
 */
export type SelectTargetFlag = "allow_locations" | "force_elusive";

/**
 * `Game.constants` values.
 */
export type GameConstants = {
    REFUND: -1
}

/**
 * The quest callback used in card blueprints.
 */
export type QuestCallback = (val: EventValue<EventKey>, done: boolean) => boolean;

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
    text: string,
    flavor: string,
    artist: string,
    cardClass: CardClass,
    collectible: boolean,
    cost: number,
    mechanics: string[],
    rarity: CardRarity,
    set: string,
    race: CardType,
    races: CardType[],
    type: CardType,
    spellSchool?: SpellSchool,
    durability?: number,
    faction?: string,
    elite?: boolean,
    attack?: number,
    health?: number,

    howToEarn?: string,
    battlegroundsNormalDbfId?: number,
    mercenariesRole?: string
};

/**
 * The abilities that a blueprint can have. (From CardAbility)
 */
type BlueprintAbilities = {
    [Property in CardAbility]?: KeywordMethod;
}

/**
 * The blueprint of a card.
 */
export type Blueprint = {
    name: string,
    displayName?: string,
    stats?: number[],
    desc: string,
    mana: number,
    type: CardType,

    tribe?: MinionTribe,
    spellClass?: SpellSchool,
    cooldown?: number,
    hpDesc?: string,
    hpCost?: number,

    classes: CardClass[],
    rarity: CardRarity,
    keywords?: CardKeyword[],

    runes?: string,
    dormant?: number,
    colossal?: string[],
    corrupt?: string,
    settings?: any,

    conditioned?: CardAbility[],
    storage?: { [key: string]: any },

    uncollectible?: boolean,
    id: number,
} & BlueprintAbilities;

/**
 * The keyword method (kvm / ability) of a card.
 */
export type KeywordMethod = (plr: Player, game: Game, self: Card, key?: EventKey, val?: EventValue<EventKey>) => any;

/**
 * The event listener callback. The second callback of the `Functions.addEventListener` function.
 */
export type EventListenerCallback = (val: EventValue<EventKey>) => any;
/**
 * The event listener check callback. The first callback of the `Functions.addEventListener` function.
 */
export type EventListenerCheckCallback = (val?: EventValue<EventKey>) => boolean | undefined;

/**
 * A card-like object.
 */
export type CardLike = Card | Blueprint;
/**
 * A target.
 */
export type Target = Card | Player;

/**
 * Callback for tick hooks. Used in `Functions.hookToTick`.
 */
export type TickHookCallback = (key?: EventKey, val?: EventValue<EventKey>) => void;

/**
 * AI history object.
 */
export type AIHistory = {
    type: string,
    data: any
}

/**
 * Enchantment object.
 */
export type EnchantmentDefinition = {
    enchantment: string,
    owner: Card
}

/**
 * Game configuration
 */
export type GameConfig = {
    // general.json
    debug: boolean,
    validateDecks: boolean,
    minDeckLength: number,
    maxDeckLength: number,
    maxBoardSpace: number,
    maxOfOneCard: number,
    maxOfOneLegendary: number,

    P1AI: boolean,
    P2AI: boolean,

    editor: string,

    topicBranchWarning: boolean

    // advanced.json
    reloadCommandConfirmation: boolean,
    getReadableCardMaxDepth: number,
    getReadableCardNoRecursion: boolean,
    getReadableCardAlwaysShowFullCard: boolean,

    whitelistedHistoryKeys: EventKey[],
    hideValueHistoryKeys: EventKey[],

    // dont-change.json
    version: string,
    branch: "stable" | "dev" | "topic",

    versionText: string,
    todo: {[key: string]: string[]},

    stableIntroText: string,
    developIntroText: string,
    topicIntroText: string,

    // ai.json
    AIContextAnalysis: boolean,
    AIAttackModel: number,
    AIMulliganThreshold: number
    AITradeThreshold: number,
    AIStatsBias: number
    AIManaBias: number
    AISpellValue: number,
    AIKeywordValue: number
    AIFunctionValue: number,

    AIProtectThreshold: number,
    AIIgnoreThreshold: number,
    AIRiskThreshold: number,

    AISentiments: {
        positive: {[key: string]: number},
        negative: {[key: string]: number}
    }
}

export type EventManagerEvents = {[key in EventKey]?: [[[any, number]], [[any, number]]]};