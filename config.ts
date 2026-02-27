import { Ability, Event, type GameConfig } from "@Game/types.ts";

export const config: GameConfig = {
	general: {
		// The locale (aka. language) to use. If the specified locale doesn't exist, it will default to 'en_US'.
		locale: "en_US",

		/*
		 * The editor that gets launched whenever the game wants to launch an editor.
		 * This happens after creating a card using the Custom Card Creator, for example.
		 * You can set this to any path you want. (e.g. /usr/bin/code or vim)
		 */
		editor: "code",

		// How many cards can be on a player's board at once.
		maxBoardSpace: 7,

		// The maximum amount of cards that is allowed in a hand. Don't go under 4 or the game will crash on start.
		maxHandLength: 10,

		// If you are a no-fun partypooper, you can set this to `true` to disable all time-based events.
		disableEvents: false,

		// If you are the type of person to set `disableEvents` to `true` (see above) or if you have already seen all the fun facts,
		// you can set this to `true` to disable fun facts. You monster...
		disableFunFacts: false,

		// The url to the registry. This is so that it can use the registry's API.
		// Leave this as-is unless you have a reason to change it.
		registryUrl: "https://hs.lunartides.dev/registry",

		// If the game should warn you about being on a topic branch.
		topicBranchWarning: true,
	},

	decks: {
		/*
		 * If the game should validate deck codes.
		 * If this is disabled, the game will accept ANY correctly formatted deckcode.
		 */
		validate: true,

		// The minimum amount of cards that is allowed in a deck
		minLength: 30,

		// The maximum amount of cards that is allowed in a deck
		maxLength: 30,

		/*
		 * How many of one card is allowed in a deck.
		 * For example, you are only allowed up to x2 Sheep in a deck
		 */
		maxOfOneCard: 2,

		/*
		 * How many of one legendary card is allowed in a deck.
		 * For example, you are only allowed x1 Brann Bronzebeard in a deck.
		 */
		maxOfOneLegendary: 1,
	},

	audio: {
		// Globally disable playing audio.
		// This also stops the audio engine from being invoked, which can save resources.
		disable: false,

		sfx: {
			// Enable playing sound effects.
			enable: true,

			blacklist: [
				// UI Navigation
				// "ui.delve",
				// "ui.back",
				// "ui.delete",
				// "ui.leaveLoop",
				// "ui.action1",
				//
				// Typing
				// "input.type",
				// "input.backspace",
				// "input.tab",
				// "input.arrow.up",
				// "input.arrow.down",
				// "input.enter",
				//
				// Game Feedback
				// "game.playCard",
				// "game.endTurn",
				//
				// Other
				// "error",
			],
		},
	},

	networking: {
		allow: {
			/*
			 * Allow the game to perform networking requests.
			 * If this is true, it will still prompt you before making any requests.
			 */
			game: false,

			/*
			 * Allow packs to perform networking requests.
			 * BE CAREFUL! Packs from official sources have to be approved by a moderator, but they might not be 100% safe.
			 * Enable at your own risk!
			 */
			packs: false,
		},
	},

	debug: {
		/*
		 * If this is enabled, ALL debug settings under this category gets enabled.
		 *
		 * Disable this to pick and choose which debug settings to enable.
		 */
		all: true,

		/*
		 * If debug commands should be enabled.
		 *
		 * This enables commands like "/give", "/eval", and "/history".
		 */
		commands: false,

		// You need to type this as the first character(s) to run debug commands
		commandPrefix: "/",

		/*
		 * If it should allow players using the test deck.
		 *
		 * If this is enabled, and you don't input a deckcode when prompted, you will get a deck filled with 30 Sheep.
		 *
		 * If you're not on a stable branch, this gets overriden to `true`.
		 */
		allowTestDeck: false,

		/*
		 * If this is enabled, it doesn't show the license when you play.
		 */
		hideLicense: false,

		/*
		 * If cards should show additional information. (id, uuid, tags, etc...)
		 */
		additionalInfoInReadable: false,

		/*
		 * If this is enabled, it shows the commit hash in the version of the watermark.
		 */
		showCommitHash: false,
	},

	ai: {
		// If the starting player should be assigned an AI.
		player1: false,

		// If the player that starts with the coin should be assigned an AI.
		player2: true,

		/*
		 * If this is true, it assigns an AI to a random player.
		 *
		 * `AI > Player 1` and `AI > Player 2` should probably be disabled when this is enabled, unless you want to pit two AIs against each other.
		 */
		random: false,

		// Which AI model the players should use.
		// The available options are "sentiment" and "simulation".
		// Sentiment is older and far less accurate, but faster.
		// Simulation is newer and far more accurate, but slower. It is also experimental.
		player1Model: "simulation",
		player2Model: "sentiment",

		// Options for the simulation model.
		// The simulation model plays cards in a "simulation" of the game.
		// This allows it to see exactly what every card does.
		//
		// Due to having to create a simulation per action at depth 1, it is also quite slow.
		simulation: {
			// How far into the future the AI will predict.
			// It cannot see your cards unless '... > Difficulty > Mirror' is true.
			depth: 3,

			// The future is uncertain. Therefore, the further the AI sees into the future,
			// the less valuable that information is.
			//
			// This is how much is scales. The formula is: evaluation -= currentDepth * depthCost
			depthCost: 2,

			difficulty: {
				// If the card can see cards burned in the future.
				// This allows the AI to avoid actions that burns cards in the future.
				canSeeFutureBurnedCards: true,

				// If enabled, the AI will play a mirror-match with itself every turn.
				// This makes the AI a lot more accurate, at the cost of revealing your hand to the AI.
				mirror: true,
			},
		},

		// Options for the sentiment model.
		//
		// The sentiment model scores cards based on superficial information,
		// and looks for certain words in the card's text.
		// This is pretty much educated guessing.
		//
		// Due to only having to do a little math, and regex calculations, this model is quite fast.
		sentiment: {
			// If the ai should look at the context of a card's description in order to judge more accurately.
			contextAnalysis: true,

			/*
			 * Which attacking model should the ai use.
			 * For example, 1 will use the legacy attacking model
			 * Set to -1 to use the latest model.
			 */
			attackModel: -1,

			// How much score a card needs to be spared from mulliganing.
			mulliganThreshold: 3,

			// How much score a card needs to not be traded.
			tradeThreshold: 2,

			/*
			 * How much the ai values spells. This exists for equality with minions, since minions gets stats.
			 * The formula is: score += spellValue * statsBias
			 */
			spellValue: 4,

			/*
			 * How much the ai values keywords.
			 * The formula is: score += amountOfKeywords * keywordValue
			 */
			keywordValue: 2,

			/*
			 * How much the ai values abilites.
			 * The formula is: score += amountOfAbilities * abilityValue
			 */
			abilityValue: 1,

			/*
			 * How much score a card needs for the ai to "protect" it.
			 * Protecting for the ai means to not attack with that minion, unless the minion attacks the enemy hero directly.
			 */
			protectThreshold: 5,

			/*
			 * How much score a card needs for the ai to "ignore" it.
			 * Ignoring a minion for the ai means to not "waste resources" attacking that minion.
			 */
			ignoreThreshold: -1,

			/*
			 * How much of an advantage the ai needs to be at in order to enter "risk mode".
			 * While in risk mode, the ai ignores all minions on your board and tries to rush your face to kill you as fast as possible.
			 */
			riskThreshold: 10,

			sentiments: {
				// The ai's positive sentiments.
				positive: {
					/*
					 * Any number with a plus in front of it.
					 * For example, +1
					 */
					"\\+\\d+": 1,

					/*
					 * Anything formed like this "d/d" where "d" is a number.
					 * For example, 1/1
					 */
					"\\d+/\\d+": 1,

					heal: 0.5,
					give: 2,
					gain: 1,
					set: 1,
					restore: 0.5,
					attack: 0.5,
					health: 0.5,
					copy: 2,
					draw: 2,
					mana: 1,
					hand: 1,
					deck: 1,
					battlefield: 1,
					trigger: 3,
					twice: 2,
					double: 2,
					your: 1,
					maximum: 1,
					crystal: 1,
					add: 2,
					permanent: 3,
				},

				// The ai's negative sentiments
				negative: {
					/*
					 * Any number with a minus in front of it.
					 * For example, -1
					 */
					"-\\d+": 1,

					deal: 1,
					remove: 2,
					damage: 1,
					silence: 5,
					destroy: 9,
					kill: 3,
				},
			},
		},

		// The higher the numer is, the more the AI will try to persue it.
		biases: {
			card: {
				/*
				 * How much the ai values stats.
				 * The formula is: score += (attack + health) * statsBias
				 * For example, at 0.2, 1/1 stats is valued at 0.4
				 * Another example, at 1, 1/1 stats is valued at 2
				 */
				stats: 0.2,

				/*
				 * How much the ai dislikes mana cost.
				 * The formula is: score -= cost * costBias
				 */
				cost: 0.333,

				// How much the AI dislikes burning cards.
				burn: 5,
			},

			player: {
				// How much the AI likes health.
				health: 3,

				// How much the AI likes max health.
				maxHealth: 10,

				// How much the AI likes attack.
				attack: 2,

				// How much the AI likes armor.
				armor: 2,

				// How much the AI likes empty mana crystals.
				emptyMana: 5,

				// How much the AI likes max mana.
				maxMana: 10,

				// How much the AI likes spell damage.
				spellDamage: 1,

				// How much the AI likes quests.
				quests: 10,

				// How much the AI likes having more cards in their hand.
				// This should nudge the AI towards saving cards if they don't currently do anything.
				hand: 0.25,

				// How much the AI likes having more cards on the board.
				board: 2,
			},
		},
	},

	advanced: {
		/*
		 * If this is true, the game will have a chance to add a DIY card to a player's hand.
		 * This is to encourage players to make their own cards
		 * DIY cards do not do anything by default, so this won't give any advantage.
		 */
		spawnInDiyCards: true,

		/*
		 * The chance of a DIY card spawning every turn.
		 * This is a number from 0 to 1
		 */
		diyCardSpawnChance: 1 / 100,

		/**
		 * If it should use the old pre-4.0.0 interface for the "Which card do you want to play?" prompt.
		 * This is equivalent to pressing "Type in" every time
		 */
		gameloopUseOldUserInterface: false,

		/*
		 * If this is true, the deckcreator will also show uncollectible cards.
		 * These deckcodes will be rejected by the game as psuedo-valid if `Decks > Validate` is true.
		 */
		deckcreatorShowUncollectible: false,

		/*
		 * If this is true, `Card.readable` will only show the top level of a card.
		 * This will prevent cards from referencing other cards in their description however it will still show that card's name.
		 * Enable this if you don't like cards showing other cards in their description.
		 */
		cardReadableNoRecursion: false,

		/*
		 * If this is true, `Card.readable` will always show the full card in another card's description
		 * instead of it only being in detail mode.
		 */
		cardReadableAlwaysShowFullCard: false,

		/*
		 * This is how many cards `Card.readable` can display at once.
		 * This is to prevent a card from referencing itself, which would cause an infinite loop.
		 * I highly recommend keeping this value below 20 since there is no real reason to go above it.
		 */
		cardReadableMaxDepth: 10,

		/**
		 * This is how many times the 'Forgetful' keyword can try to attack a random target before giving up.
		 * This is to prevent the game from getting stuck in an endless loop if none of the possible targets can be attacked.
		 */
		forgetfulRandomTargetFailAmount: 25,

		/**
		 * These abilities can't be cancelled. They ignore the `Card.REFUND` return value.
		 */
		uncancellableAbilities: [Ability.Deathrattle],

		/**
		 * These abilities don't add the cancelled card to the player's hand when the card is cancelled.
		 */
		noBounceOnCancelAbilities: [
			Ability.Create,
			Ability.Use,
			Ability.HeroPower,
			Ability.EnchantmentSetup,
			Ability.EnchantmentApply,
			Ability.EnchantmentRemove,
		],

		/*
		 * These are the keys that will show up when running the history command.
		 * Look in `src/types.ts` at the `EventKey` type for a list of valid keys.
		 * Also, the log files override this list and instead shows every valid key
		 */
		whitelistedHistoryKeys: [
			Event.HealthRestored,
			Event.UnspentMana,
			Event.GainOverload,
			Event.GainHeroAttack,
			Event.TakeDamage,
			Event.PlayCard,
			Event.SummonCard,
			Event.DestroyCard,
			Event.DamageCard,
			Event.SilenceCard,
			Event.DiscardCard,
			Event.TradeCard,
			Event.ForgeCard,
			Event.FreezeCard,
			Event.RevealCard,
			Event.BurnCard,
			Event.Titan,
			Event.AddCardToDeck,
			Event.AddCardToHand,
			Event.DrawCard,
			Event.Attack,
			Event.HeroPower,
			Event.TargetSelectionStarts,
			Event.TargetSelected,
			Event.CardEvent,
		],

		/*
		 * These keys will have their value hidden when running the history command unless you caused the event.
		 * This is to, for example, hide the opponent's drawn card from the history while still showing that event happened.
		 * The log files override this list and shows the value regardless.
		 */
		hideValueHistoryKeys: [
			Event.DrawCard,
			Event.ForgeCard,
			// Event.BurnCard,
			Event.AddCardToHand,
			Event.AddCardToDeck,
		],
	},

	info: {
		// DONT CHANGE ANY OF THESE VALUES UNLESS YOU KNOW WHAT YOU'RE DOING.

		// The text that is displayed along this specific version/branch combination.
		versionText: "",

		// Some stuff that should really be constants
		stableIntroText:
			"This is the stable branch. This branch is older, but is more stable. I recommend you use this branch.",
		betaIntroText:
			"This is the beta branch. This has more features, but is less stable. I would advise against using this branch if you can help it. The todo list is not final and can change.",
		alphaIntroText:
			"This is the alpha branch. This is the bleeding edge of Hearthstone.js. I would highly advise against using this branch if you can help it. Expect many bugs and breaking changes.",
		topicIntroText:
			"This is a topic (feature) branch. This branch exists to add one single feature, can be highly unstable, and will be deleted in the future once the feature is done. I HIGHLY RECOMMEND NOT USING THIS BRANCH FOR ANY REASON.",

		githubUrl: "https://github.com/LunarTides/Hearthstone.js",
	},
};
