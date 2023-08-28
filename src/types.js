const { Card } = require("./card");
const { Game } = require("./game");
const { Player } = require("./player");

//@ts-check

/**
 * A scored card
 * 
 * @typedef {Object} ScoredCard
 * @property {Card} card
 * @property {number} score
 */

/**
 * Card Types
 * 
 * @typedef {"Minion" |
 * "Spell" |
 * "Weapon" |
 * "Hero" |
 * "Location" |
 * "Undefined"} CardType
 */

/**
 * Card Classes
 * 
 * @typedef {"Neutral" |
 * "Death Knight" |
 * "Demon Hunter" |
 * "Druid" |
 * "Hunter" |
 * "Mage" |
 * "Paladin" |
 * "Priest" |
 * "Rogue" |
 * "Shaman" |
 * "Warlock" |
 * "Warrior"} CardClass
 */

/**
 * Card Rarities
 * 
 * @typedef {"Free" |
 * "Common" |
 * "Rare" |
 * "Epic" |
 * "Legendary"} CardRarity
 */

/**
 * Card Cost Type
 * 
 * @typedef {"mana" |
 * "armor" |
 * "health"} CostType
 */

/**
 * Card Spell Schools
 * 
 * @typedef {"Arcane" |
 * "Fel" | 
 * "Fire" |
 * "Frost" |
 * "Holy" |
 * "Nature" |
 * "Shadow" |
 * "General"} SpellSchool
 */

/**
 * Minion Tribes
 * 
 * @typedef {"Beast" |
 * "Demon" |
 * "Dragon" |
 * "Elemental" |
 * "Mech" |
 * "Murloc" |
 * "Naga" |
 * "Pirate" |
 * "Quilboar" |
 * "Totem" |
 * "Undead" |
 * "All" |
 * "None"} MinionTribe
 */

/**
 * Card Keywords
 * 
 * @typedef {"Battlecry" |
 * "Deathrattle" |
 * "Divine Shield"|
 * "Dormant" |
 * "Lifesteal" |
 * "Poisonous" |
 * "Reborn" |
 * "Rush" |
 * "Stealth" |
 * "Taunt" |
 * "Tradeable" |
 * "Windfury" |
 * "Combo" |
 * "Outcast" |
 * "Overheal" |
 * "Cast On Draw" |
 * "Charge" |
 * "Mega-Windfury" |
 * "Echo" |
 * "Magnetic" |
 * "Twinspell" |
 * "Elusive" |
 * "Cleave"} CardKeyword
 */

/**
 * Event Keys
 * 
 * @typedef {"FatalDamage" |
 * "EndTurn" |
 * "StartTurn" |
 * "HealthRestored" |
 * "UnspentMana" |
 * "GainOverload" |
 * "GainHeroAttack" |
 * "TakeDamage" |
 * "PlayCard" |
 * "PlayCardUnsafe" |
 * "SummonMinion" |
 * "KillMinion" |
 * "DamageMinion" |
 * "CancelCard" |
 * "CastSpellOnMinion" |
 * "TradeCard" |
 * "FreezeCard" |
 * "CreateCard" |
 * "AddCardToDeck" |
 * "AddCardToHand" |
 * "DrawCard" |
 * "SpellDealsDamage" |
 * "Attack" |
 * "HeroPower" |
 * "TargetSelectionStarts" |
 * "TargetSelected" |
 * "Dummy" |
 * "Eval" |
 * "Input"} EventKeys
 */

/**
 * Game.prototype.playCard return values
 * 
 * @typedef {Card | true | "mana" | "traded" | "space" | "magnetize" | "colossal" | "refund" | "counter" | "invalid"} GamePlayCardReturn
 */

/**
 * @typedef {any} EventValues
 */

/**
 * @typedef {"allow_locations" |
 * "force_elusive"} SelectTargetFlags
 */

/**
 * @typedef {Object} GameConstants
 * @property {-1} REFUND
 */

/**
 * @callback QuestCallback
 * @param {EventValues} val The value of the event
 * @param {number} turn The turn the quest was played
 * @param {boolean} done If the quest is done
 */

/**
 * @typedef {Object} QuestType
 * @property {string} name The quest owner's display name
 * @property {number[]} progress [current, target]
 * @property {EventKeys} key The key that the quest listens for
 * @property {EventValues} value The value of the event
 * @property {number} turn The turn that the quest was played
 * @property {QuestCallback} callback The function to call when the correct event is broadcast
 * @property {string} [next=null] The name of the card containing the next quest. Only used in questlines.
 */

/**
 * @typedef {Object} VanillaCard
 * @property {string} id
 * @property {number} dbfId
 * @property {string} name
 * @property {string} text
 * @property {string} flavor
 * @property {string} artist
 * @property {CardClass} cardClass
 * @property {boolean} collectible
 * @property {number} cost
 * @property {string[]} mechanics
 * @property {CardRarity} rarity
 * @property {string} set
 * @property {CardType} type
 * @property {string} [faction]
 * @property {boolean} [elite]
 * @property {number} [attack]
 * @property {number} [health]
 * 
 * @property {string} [howToEarn]
 * @property {number} [battlegroundsNormalDbfId]
 * @property {string} [mercenariesRole]
 */

/**
 * Card Blueprint
 * 
 * @typedef {Object} Blueprint
 * @property {string} name
 * @property {string} desc
 * @property {number} mana
 * @property {CardType} type
 * @property {CardClass} class
 * @property {CardRarity} rarity
 * 
 * @property {boolean} [uncollectible=false]
 * @property {number} [id]
 * @property {string} [displayName]
 * 
 * @property {number[]} [stats]
 * @property {MinionTribe} [tribe]
 * 
 * @property {SpellSchool} [spellClass]
 * 
 * @property {number} [cooldown]
 * 
 * @property {string} [hpDesc]
 * @property {number} [hpCost]
 * 
 * @property {CardKeyword[]} [keywords]
 * 
 * @property {string[]} [runes]
 * @property {string[]} [colossal]
 * @property {string} [corrupt]
 * @property {Object} [settings]
 */

/**
 * Card Keyword Method. Also known as `Triggered effect abilities` or `Triggered keywords` in vanilla hearthstone.
 * 
 * If this returns `-1`, it refunds the card, and broadcast's the `CancelCard` event.
 * 
 * @callback KeywordMethod
 * @param {Player} plr The card's owner
 * @param {Game} game The game
 * @param {Card} self The card
 * 
 * @param {EventKeys} [key] The event's key
 * @param {EventValues} [val] The event's value
 * 
 * @returns {any}
 */

/**
 * @callback EventListenerCallback
 * 
 * @param {import('./types').EventKeys} key The key of the event
 * @param {import('./types').EventValues} val The value of the event
 * 
 * @returns {any} The return value
 */

/**
 * @callback TargetCallback
 * @param {Card | Player} target The target
*/

/**
 * @callback EventListenerCheckCallback
 * @param {any} [val] The value of the event.
 * 
 * @returns {boolean | undefined} If this returns true, destroy the event listener.
 */

/**
 * @typedef {Object} AIHistory
 * @property {string} type
 * @property {any} data
 */

/**
 * @typedef {Object} EnchantmentDefinition
 * @property {string} enchantment - The enchantment string. E.g. "-1 mana"
 * @property {Card} owner - The card that the enchantment belongs to
 */