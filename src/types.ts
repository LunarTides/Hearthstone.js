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

export type CardKeyword = CardTrueKeyword | CardAbility;

export type CardTrueKeyword = "Divine Shield" |
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

export type CardAbility = "Battlecry" |
                            "Deathrattle" |
                            "Combo" |
                            "Outcast" |
                            "Overheal";

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

export type EventValue<Key extends EventKey> = Key extends "FatalDamage" ? null :
                                               Key extends "EndTurn" ? number :
                                               Key extends "StartTurn" ? number :
                                               Key extends "HealthRestored" ? number :
                                               Key extends "UnspentMana" ? number :
                                               Key extends "GainOverload" ? number :
                                               Key extends "GainHeroAttack" ? number :
                                               Key extends "TakeDamage" ? number :
                                               Key extends "PlayCard" ? Card :
                                               Key extends "PlayCardUnsafe" ? Card :
                                               Key extends "SummonMinion" ? Card :
                                               Key extends "KillMinion" ? Card :
                                               Key extends "DamageMinion" ? [Card, number] :
                                               Key extends "CancelCard" ? [Card, CardAbility] :
                                               Key extends "CastSpellOnMinion" ? [Card, Card] :
                                               Key extends "TradeCard" ? Card :
                                               Key extends "FreezeCard" ? Card :
                                               Key extends "CreateCard" ? Card :
                                               Key extends "AddCardToDeck" ? Card :
                                               Key extends "AddCardToHand" ? Card :
                                               Key extends "DrawCard" ? Card :
                                               Key extends "SpellDealsDamage" ? [Target, number] :
                                               Key extends "Attack" ? [Target, Target] :
                                               Key extends "HeroPower" ? string :
                                               Key extends "Eval" ? string :
                                               Key extends "Input" ? string :
                                               Key extends "TargetSelectionStarts" ? [string, Card, "enemy" | "friendly", "hero" | "minion", SelectTargetFlag[]] :
                                               Key extends "TargetSelected" ? [Card, Target] :
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

    passive: KeywordMethod
};

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