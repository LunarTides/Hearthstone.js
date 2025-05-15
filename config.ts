import { Event, type GameConfig } from "@Game/types.ts";

export const config: GameConfig = {
	general: {
		// The locale (aka. language) to use. If the specified locale doesn't exist, it will default to 'en_US'.
		locale: "en_US",

		/*
		 * Debug mode enables debug commands, and hides redundant information.
		 * Only enable this if you want to test the game / add cards.
		 */
		debug: true,

		/*
		 * The editor that gets launched whenever the game wants to launch an editor.
		 * This happens after creating a card using the Custom Card Creator, for example.
		 * You can set this to any path you want. (e.g. /usr/bin/code or vim)
		 */
		editor: "code",

		// If the game should warn you about being on a topic branch.
		topicBranchWarning: true,

		// How many cards can be on a player's board at once.
		maxBoardSpace: 7,

		// The maximum amount of cards that is allowed in a hand. Don't go under 4 or the game will crash on start.
		maxHandLength: 10,

		// If you are a no-fun partypooper, you can set this to `true` to disable all time-based events.
		disableEvents: false,

		// If you are the type of person to set `disableEvents` to `true` (see above) or if you have already seen all the fun facts,
		// you can set this to `true` to disable fun facts. You monster...
		disableFunFacts: false,
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

	ai: {
		// If the starting player should be assigned an AI.
		player1: false,

		// If the player that starts with the coin should be assigned an AI.
		player2: true,

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
		 * How much the ai values stats.
		 * The formula is: score += (attack + health) * statsBias
		 * For example, at 0.2, 1/1 stats is valued at 0.4
		 * Another example, at 1, 1/1 stats is valued at 2
		 */
		statsBias: 0.2,

		/*
		 * How much the ai dislikes mana cost.
		 * The formula is: score -= cost * costBias
		 */
		costBias: 0.75,

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
				"\\x\\d+": 1,

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

	advanced: {
		// You need to type this as the first character(s) to run debug commands
		debugCommandPrefix: "/",

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

		/*
		 * If this is true, the deckcreator will also show uncollectible cards.
		 * These deckcodes will be rejected by the game as psuedo-valid if `Decks > Validate` is true.
		 */
		dcShowUncollectible: false,

		/*
		 * If this is true, `Card.readable` will only show the top level of a card.
		 * This will prevent cards from referencing other cards in their description however it will still show that card's name.
		 * Enable this if you don't like cards showing other cards in their description.
		 */
		getReadableCardNoRecursion: false,

		/*
		 * If this is true, `Card.readable` will always show the full card in another card's description
		 * instead of it only being in detail mode.
		 */
		getReadableCardAlwaysShowFullCard: false,

		/*
		 * This is how many cards `Card.readable` can display at once.
		 * This is to prevent a card from referencing itself, which would cause an infinite loop.
		 * I highly recommend keeping this value below 20 since there is no real reason to go above it.
		 */
		getReadableCardMaxDepth: 10,

		/**
		 * This is how many times the 'Forgetful' keyword can try to attack a random target before giving up.
		 * This is to prevent the game from getting stuck in an endless loop if none of the possible targets can be attacked.
		 */
		forgetfulRandomTargetFailAmount: 25,

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

	// Just add a bunch of fun facts about the project here. It's nice to relive its history considering it is 3 years old now. Time sure does fly...
	funFacts: [
		// AI
		"The AI was added before the card creator. I always forget that for some reason...",
		"The AI works by analyzing the cards in its hand, and playing the ones with the highest 'score'. It also does some basic sentiment analysis by looking at the card's description.",
		"The AI doesn't know more than you do. Except for the cards in its own hand, of course. Incidentally, did you know that the AI is more scared of you than you are of it? I don't blame it...",
		"The AI is currently pretty stupid. I plan on improving it later by running it in a simulation and evaluating the game state after certain moves.",

		// 2.0
		"Version 2.0 originally started as version 1.7, but then I concluded that rewriting the entire codebase in TypeScript would somehow be a quick and easy job.",
		"Version 2.0 began development on August 21, 2023, and released on December 31st, 2023. It was released since ~7 hours before 2024 I decided I would release it before the new year.",
		"Version 2.0 originally came with a script to upgrade pre-2.0 cards. The problem was that the update ended up having so many breaking changes that it was unreasonable to write an upgrade script that would cover all the edge-cases.",
		"Hearthstone.js was originally going to be renamed to Hearthstone.ts after 2.0, but it just didn't sound right to me. Maybe I just got used to the name...",
		"Shortly after 2.0 was released, I got majorly burned out. I made 120 commits throughout the <i>entirety</i> of 2024. Compared to the ~1.3k commits in total, that was not much. I have gotten better recently though.",
		"The amount of lines of code in Hearthstone.js between 1.6.2 and 2.0 is pretty much the same, despite the codebase being incredibly different. Most of that comes from the cards that were removed in 2.0.",

		// 3.0
		"Version 3.0 began development on January 4th, 2024, and is currently still in development 15 months later.",

		// Tools / Scripts
		"The card creator was originally created in Python, but was changed to JavaScript later on to improve readability, compatability, and maintainability. The holy trinity of coding...",
		"The deck creator has, surpisingly enough, not undergone too many changes since its creation.",
		"The id script was originally made to change ids in the early stages of 2.0 development, but ended up being useful for discovering holes and duplicates in ids, so it stayed.",
		"I have scripts to ensure that cards work correctly and that the game doesn't crash, but it can still happen. Please report any bugs you find.",

		// Bugs
		"There existed an ancient bug that terrorized me ever since Hearthstone.py V1. I called this dreaded bug 'The Linking Bug'. It was so dastardly, so tutungerdly, that it defies words. It is truly the most photosynthesis bug of them all.",
		"I know I shouldn't talk about it but I will anyways. The linking bug-",

		// History
		"The first commit of Hearthstone.js was made on February 14th, 2022, but it had been in development for a while before that. Unfortunately, the versions before the first commit are lost to time.",
		"There existed 2 versions of Hearthstone.js before this one. These were later called 'Hearthstone.py V1' and 'Hearthstone.py V2'. They are still available under my 'Python' repository.",
		"From August 22nd, 2022 to August 31st, 2023, I used an alt account (IsakSkole123) to work on Hearthstone.js when I didn't have access to my main computer.",
		"The earliest versions of Hearthstone.js used the JSON format to store cards. This was changed to JS in a4805f9, commit number 10.",
		"The Hearthstone.js code structure has been radically changed over the course of the project's lifetime.",
		"When I began working on Hearthstone.js, I knew next to nothing about JavaScript, and even less about TypeScript. I feel the appropriate amount of shame looking back.",
		"The very first version of Hearthstone.js was written in Python. I changed the language to JavaScript since I couldn't figure out how to dynamically import the cards in Python.",
		"I originally didn't format my code using a formatter. When I realized that I should probably do that, I began using 'xo'. I switched to 'biome' after I saw people discussing it in other repos.",
		"I accidentally included a backup of the code in the first commit. That is the earliest version of Hearthstone.js in existence.",
		"In the oldest versions of Hearthstone.js, you had to name the players before playing. This was removed for the sake of debugging speed, but names remained. They were finally properly removed in 70f80b6.",

		// Other
		"Hearthstone.js is the project I am most proud of. I hope you enjoy it.",
		"Hearthstone.js has reached 10 stars on GitHub. Thanks for the support!",
		"English is my second language, so expect some typos, grammar errors, and (probably) most of all, punctuation errors. Please report them if you see any.",
		"I switched to Bun since it actually solved some issues I had. I don't know if Node.js was bugged, but with Bun I was able to re-add card reloading, for example.",
		"As of writing this, there is an usused event in Hearthstone.js called 'Pride Month' which is active all of June. Make of that what you will.",
		"I have still not learned everything TypeScript has to offer. Only 2 days ago (at the time of writing), I discovered type guard functions, which were used in ad6394d to narrow down the type of the 'value' parameter in passives. If that doesn't mean anything to you, please accept this emoji of a bunny as an apology: 🐿️",
		"New features are constantly added and removed in the main branch. Don't be surprised if you see something new, or if something old / useless is removed.",
		"One of my philosophies with Hearthstone.js is to make it <i>incredibly</i> easy to add new stuff. I achieve this not only by making tools like the card creators, but through making the codebase highly modular and extendable.",
		"Check out Hearthstone.gd for a version of Hearthstone.js made in Godot. It is in very early stages of development and is currently stuck in limbo.",
		"There is another Hearthstone.py (not to be confused with Hearthstone.py V1 / V2) currently in development. It might not see the light of day, but it exists.",
	],
};
