import { Card } from "./card";
import { Game } from "./game";
import { Player } from "./player";

export type ScoredCard = {
    card: Card,
    score: number,
}

export type CardType = "Minion" | "Spell" | "Weapon" | "Hero" | "Location" | "Undefined";

export type CardClass = "Neutral" | "Death Knight" | "Demon Hunter" | "Druid" | "Hunter" | "Mage" | "Paladin" | "Priest" | "Rogue" | "Shaman" | "Warlock" | "Warrior";

export type CardRarity = "Free" | "Common" | "Rare" | "Epic" | "Legendary";

export type CostType = "mana" | "armor" | "health";

export type SpellSchool = "Arcane" | "Fel" | "Fire" | "Frost" | "Holy" | "Nature" | "Shadow" | "General";

export type MinionTribe = "Beast" | "Demon" | "Dragon" | "Elemental" | "Mech" | "Murloc" | "Naga" | "Pirate" | "Quilboar" | "Totem" | "Undead" | "All";

export type CardKeyword = "Battlecry" | "Deathrattle" | "Divine Shield" | "Dormant" | "Lifesteal" | "Poisonous" | "Reborn" | "Rush" | "Stealth" | "Taunt" | "Tradeable" | "Windfury" | "Combo" | "Outcast" | "Overheal" | "Cast On Draw" | "Charge" | "Mega-Windfury" | "Echo" | "Magnetic" | "Twinspell" | "Elusive" | "Cleave";

export type EventKeys = "FatalDamage" | "EndTurn" | "StartTurn" | "HealthRestored" | "UnspentMana" | "GainOverload" | "GainHeroAttack" | "TakeDamage" | "PlayCard" | "PlayCardUnsafe" | "SummonMinion" | "KillMinion" | "DamageMinion" | "CancelCard" | "CastSpellOnMinion" | "TradeCard" | "FreezeCard" | "CreateCard" | "AddCardToDeck" | "AddCardToHand" | "DrawCard" | "SpellDealsDamage" | "Attack" | "HeroPower" | "TargetSelectionStarts" | "TargetSelected" | "Dummy" | "Eval" | "Input";

export type GamePlayCardReturn = Card | true | "mana" | "traded" | "space" | "magnetize" | "colossal" | "refund" | "counter" | "invalid";

export type EventValues = any;

export type SelectTargetFlags = "allow_locations" | "force_elusive";

export type GameConstants = {
    REFUND: -1
}

export type QuestCallback = (val: EventValues, turn: number, done: boolean) => void;

export type QuestType = {
    name: string,
    progress: [number, number],
    key: EventKeys,
    value: EventValues,
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
    settings?: any
};

export type KeywordMethod = (plr: Player, game: Game, self: Card, key?: EventKeys, val?: EventValues) => any;

export type EventListenerCallback = (key: EventKeys, val: EventValues) => any;

export type Target = Card | Player;
export type TargetCallback = (target: Target) => any;

export type EventListenerCheckCallback = (val?: EventValues) => boolean | undefined;

export type AIHistory = {
    type: string,
    data: any
}

export type EnchantmentDefinition = {
    enchantment: string,
    owner: Player
}

export type GameConfig = Object;