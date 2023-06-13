const { Card } = require("./card");

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
 * Fore" |
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