const { Card } = require("./card");
const { Game } = require("./game");
const { Player } = require("./player");

/**
 * AI Scoreboard
 * 
 * @typedef {[[Card, number]]} ScoreBoard
 */

/**
 * Card Types
 * 
 * @typedef {"Minion" |
 * "Spell" |
 * "Weapon" |
 * "Hero" |
 * "Location"} CardType
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
 * "Casts When Drawn" |
 * "Charge" |
 * "Mega-Windfury" |
 * "Echo" |
 * "Magnetic" |
 * "Twinspell" |
 * "Elusive"} CardKeyword
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
 * "AddCardToDeck" |
 * "AddCardToHand" |
 * "DrawCard" |
 * "SpellDealsDamage" |
 * "Attack" |
 * "HeroPower" |
 * "TargetSelectionStarts" |
 * "TargetSelected" |
 * "Eval"} EventKeys
 */

/**
 * @typedef {any} EventValues
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
 * 
 * @property {[number]} [stats]
 * @property {MinionTribe} [tribe]
 * 
 * @property {SpellSchool} [spellClass]
 * 
 * @property {CardKeyword[]} [keywords]
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