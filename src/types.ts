import { Card } from "./card";
import { Game } from "./game";
import { Player } from "./player";

export type ScoredCard = {
    card: Card,
    score: number,
}

export type CardType = "Minion" |
                       "Spell" |
                       "Weapon" |
                       "Hero" |
                       "Location" |
                       "Undefined";

export type CardClass = "Neutral" |
                        "Death Knight" |
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

export type CardRarity = "Free" |
                         "Common" |
                         "Rare" |
                         "Epic" |
                         "Legendary";

export type CostType = "mana" |
                       "armor" |
                       "health";

export type SpellSchool = "Arcane" |
                          "Fel" |
                          "Fire" |
                          "Frost" | "Holy" | "Nature" | "Shadow" | "General";

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
                          "All";

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

export type CardAbility = "battlecry" |
                          "combo" |
                          "deathrattle" |
                          "finale" |
                          "frenzy" |
                          "honorablekill" |
                          "inspire" |
                          "invoke" |
                          "outcast" |
                          "overheal" |
                          "overkill" |
                          "passive";
                          "spellburst";

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

export type EventValue<Key extends EventKey> = Key extends "FatalDamage" ? null : // Nothing
                                               Key extends "EndTurn" ? number : // The current turn (before turn counter increment)
                                               Key extends "StartTurn" ? number : // The current turn (after turn counter increment)
                                               Key extends "HealthRestored" ? number : // Health after restore
                                               Key extends "UnspentMana" ? number : // The amount of mana the player has left
                                               Key extends "GainOverload" ? number : // Amount of overload gained
                                               Key extends "GainHeroAttack" ? number : // Amount of hero attack gained
                                               Key extends "TakeDamage" ? number : // Amount of damage taken
                                               Key extends "PlayCard" ? Card : // The card that was played. (This gets triggered after the text of the card)
                                               Key extends "PlayCardUnsafe" ? Card : // The card that was played. (This gets triggered before the text of the card, which means it also gets triggered before the cancelling logic. So you have to handle cards being cancelled.)
                                               Key extends "SummonMinion" ? Card : // The minion that was summoned
                                               Key extends "KillMinion" ? Card : // The minion that was killed
                                               Key extends "DamageMinion" ? [Card, number] : // The minion that was damaged, and the amount of damage
                                               Key extends "CancelCard" ? [Card, CardAbility] : // The card that was cancelled, and the ability that was cancelled
                                               Key extends "CastSpellOnMinion" ? [Card, Card] : // The spell that was cast, and the target
                                               Key extends "TradeCard" ? Card : // The card that was traded
                                               Key extends "FreezeCard" ? Card : // The card that was frozen
                                               Key extends "CreateCard" ? Card : // The card that was created
                                               Key extends "AddCardToDeck" ? Card : // The card that was added to the deck
                                               Key extends "AddCardToHand" ? Card : // The card that was added to the hand
                                               Key extends "DrawCard" ? Card : // The card that was drawn
                                               Key extends "SpellDealsDamage" ? [Target, number] : // The target, and the amount of damage
                                               Key extends "Attack" ? [Target, Target] : // The attacker, and the target
                                               Key extends "HeroPower" ? string : // The class of the hero power. (Warrior, Mage, Priest, ...)
                                               Key extends "Eval" ? string : // The code to evaluate
                                               Key extends "Input" ? string : // The input
                                               Key extends "TargetSelectionStarts" ? [string, Card, SelectTargetAlignment, SelectTargetClass, SelectTargetFlag[]] : // The prompt, the card that requested target selection, the alignment that the target should be, the class of the target (hero | minion), and the flags (if any)
                                               Key extends "TargetSelected" ? [Card, Target] : // The card that requested target selection, and the target
                                               never;

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

export type FunctionsValidateCardReturn = boolean |
                                          "class" |
                                          "uncollectible" |
                                          "runes";

export type AICalcMoveOption = Card |
                               "hero power" |
                               "attack" |
                               "use" |
                               "end";

export type SelectTargetAlignment = "friendly" | "enemy";
export type SelectTargetClass = "hero" | "minion";
export type SelectTargetFlag = "allow_locations" | "force_elusive";

export type GameConstants = {
    REFUND: -1
}

export type QuestCallback = (val: EventValue<EventKey>, turn: number, done: boolean) => void;

export type QuestType = {
    name: string,
    progress: [number, number],
    key: EventKey,
    value: EventValue<EventKey>,
    turn: number,
    callback: QuestCallback,
    next?: string
};

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
    type: CardType,
    faction?: string,
    elite?: boolean,
    attack?: number,
    health?: number,

    howToEarn?: string,
    battlegroundsNormalDbfId?: number,
    mercenariesRole?: string
};

type BlueprintAbilities = {
    [Property in CardAbility]?: KeywordMethod;
}
export type Blueprint = {
    name: string,
    desc: string,
    mana: number,
    type: CardType,
    class: CardClass,
    rarity: CardRarity,

    uncollectible?: boolean,
    id?: number,
    displayName?: string,

    stats?: number[],
    tribe?: MinionTribe,

    spellClass?: SpellSchool,

    cooldown?: number,

    hpDesc?: string,
    hpCost?: number,

    keywords?: CardKeyword[],

    runes?: string[],
    colossal?: string[],
    corrupt?: string,
    settings?: any,

    placeholder?: KeywordMethod,
    condition?: KeywordMethod
} & BlueprintAbilities;

export type KeywordMethod = (plr: Player, game: Game, self: Card, key?: EventKey, val?: EventValue<EventKey>) => any;

export type EventListenerCallback = (key: EventKey, val: EventValue<EventKey>) => any;

export type CardLike = Card | Blueprint;
export type Target = Card | Player;

export type EventListenerCheckCallback = (val?: EventValue<EventKey>) => boolean | undefined;
export type TickHookCallback = (key?: EventKey, val?: EventValue<EventKey>) => void;

export type AIHistory = {
    type: string,
    data: any
}

export type EnchantmentDefinition = {
    enchantment: string,
    owner: Player
}

export type GameConfig = Object;