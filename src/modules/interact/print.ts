import type { Card } from "@Game/card.ts";
import type { Player } from "@Game/player.ts";

import boxen from "boxen";
import { parseTags } from "chalk-tags";

let seenFunFacts: string[] = [];

// Just add a bunch of fun facts about the project here. It's nice to relive its history considering it is 3 years old now. Time sure does fly...
const funFacts = [
	// AI
	"The AI was added <i>before</i> the card creator. I always forget that for some reason...",
	"The AI works by analyzing the cards in its hand, and playing the ones with the highest 'score'. It also does some basic sentiment analysis by looking at the card's description.",
	"The AI doesn't know more than you do. Except for the cards in its own hand, of course.",
	"The AI is currently pretty stupid. I plan on improving it later by running it in a simulation and evaluating the game state after certain moves.",
	"You can disable the AI by changing the 'config.ts' file. The relevant settings are under the AI category.",
	"Hearthstone.js wasn't designed with multiplayer in mind. If you want to play with someone else, you need to do it locally, and you need to somehow figure out how to prevent cheating. Maybe have an arbiter? Idk...",

	// 2.0
	"Version 2.0 originally started as version 1.7, but then I concluded that rewriting the entire codebase in TypeScript would somehow be a quick and easy job.",
	"Version 2.0 began development on August 21, 2023, and released on December 31st, 2023. ~7 hours before 2024, I decided I would release it before the new year.",
	"Version 2.0 originally came with a script to upgrade pre-2.0 cards. The problem was that the update ended up having so many breaking changes that it was unreasonable to write an upgrade script that would cover all the edge-cases.",
	"Hearthstone.js was originally going to be renamed to Hearthstone.ts after 2.0, but it just didn't sound right to me. Maybe I just got used to the name...",
	"Shortly after 2.0 was released, I got majorly burned out. I made 120 commits throughout the <i>entirety</i> of 2024. Compared to the ~1.4k commits in total, that was not much.",
	"The amount of lines of code in Hearthstone.js between 1.6.2 and 2.0 is pretty much the same, despite the codebase being incredibly different. Most of that is because a bunch of cards were removed in 2.0, leading to a decrease in code amount.",
	"The early versions of 2.0 were a <i>mess</i>. I don't know how I managed to pull through. I do remember having a lot of fun though, since I was stuck in restructure hell prior to that point.",

	// 3.0
	"Version 3.0 began development on January 4th, 2024, and was released on December 5th, 23 months later.",
	"Like 2.0, 3.0 completely changed the entire codebase. I don't mean for these updates to be so big. It just happens...",
	"Unlike 2.0, I didn't have a specific goal in mind when making 3.0. I just wanted to improve upon existing features, and add new ones. All based on what I wanted to do in the moment.",

	// 4.0
	"Version 4.0 began when I got the ideas for packages. I just kept coming up with new ideas, and the scope got bigger and bigger. Now we're here!",
	"Version 4.0 added a new user interaction interface. Prievously, you had to type stuff manually, but now you can navigate using the arrow keys!",
	"A little tip for you. Did you know you can press the first letter of an option to navigate to it? Try pressing 'e' when it asks you to select a target, and it will take you to the enemy secion!",
	"Version 4.0 added the registry. I wanted to have an official way to host packs, so I made a custom website inspired by npm.",

	// Cards
	"If you want to make your own cards, you can totally do so! Just enable developer mode in the HUB, and follow the instructions! A little coding knowledge is required though.",
	"There are example cards that show you how to make cards properly. They are found under the 'packs/@Official/examples' folder.",
	"The cards uses the exact same API that the game uses, and the game has many hooks. This allows cards near complete control over the game. If there is anything you <i>can't</i> do with cards, open an issue on GitHub, and I'll see what I can do!",
	"There are a lot of niche functions in the game API. Maybe there exists a function that allows you to do something easier?",

	// Tools
	"The card creator was originally created in Python, but was changed to JavaScript later on to improve readability, compatability, and maintainability. The holy trinity of coding...",
	"The id tool was originally made to change ids in the early stages of 2.0 development, but ended up being useful for discovering holes and duplicates in ids, so it stayed.",
	"I have tools to try to ensure that cards work correctly and that the game doesn't crash, but it can still happen. Please report any bugs you find.",
	"Scripts were removed in favor of tools in update 4.0 since they were basically the same thing at that point.",

	// Bugs
	"There existed an ancient bug that terrorized me ever since Hearthstone.py V1. I called this dreaded bug 'The Linking Bug'. It was so dastardly, so tutungerdly, that it defies words. It is truly the most photosynthesis bug of them all.",
	"I know I shouldn't talk about it but I will anyways. The linking bug-",
	"<i>cards... linking... tit-for-tat... uuids... fix... 'perfectCopy'...</i>",

	// History
	"The first commit of Hearthstone.js was made on February 14th, 2022, but it had been in development for a while before that. Unfortunately, the versions before the first commit are lost to time.",
	"The first commit of Hearthstone.js had <i>30</i> cards (0 Collectible), this increased to <i>326</i> pre 2.0 (~50% Collectible), and back down to <i>148</i> (28 Collectible) in 3.0",
	"There existed 2 versions of Hearthstone.js before this one. These were later called 'Hearthstone.py V1' and 'Hearthstone.py V2'. They are still available under my 'Python' repository.",
	"From August 22nd, 2022 to August 31st, 2023, I used an alt account (IsakSkole123) to work on Hearthstone.js when I didn't have access to my main computer.",
	"The earliest versions of Hearthstone.js used the JSON format to store cards. This was changed to JS in a4805f9, commit number 10.",
	"The Hearthstone.js code structure has been radically changed over the course of the project's lifetime.",
	"Support for vanilla cards was added in version 1.2 (ec8ce35)",
	"The HUB was originally called the <i>Runner</i>",
	"Decks existed since the first commit, but deckcodes were added in commit 917c4dd, 6 months in.",
	"Mulligan was added relatively late in development. It was added in commit c9db935, ~11 months in.",
	"The code for the stats (↓) was rewritten 3 times in total.",
	"When I began working on Hearthstone.js, I knew next to nothing about JavaScript, and even less about TypeScript. I feel the appropriate amount of shame looking back.",
	"The very first version of Hearthstone.js was written in Python. I changed the language to JavaScript since I couldn't figure out how to dynamically import the cards in Python.",
	"I originally didn't format my code using a formatter. When I realized that I should probably do that, I began using 'xo'. I switched to 'biome' after I saw people discussing it in other repos.",
	"I accidentally included a backup of the code in the first commit. That is the earliest version of Hearthstone.js in existence.",
	"In the oldest versions of Hearthstone.js, you had to name the players before playing. This was removed for the sake of debugging speed, but names remained. They were finally properly removed in 70f80b6, commit number 1,356.",
	"The code in older versions of Hearthstone.js was awful, please don't look at it! The current code is a <i>lot</i> better, albeit not perfect.",
	"The API has gone through <i>many</i> restructurings. To the point where I don't even remember all of them...",

	// Features
	"New features are constantly added and removed in the main branch. Don't be surprised if you see something new, or if something old / useless is removed.",
	"Look through the 'config.ts' file for lots of configuration options! I'm sure you'll find <i>something</i> interesting...",
	"If you want to disable these fun facts (for some reason), you can do so by changing the 'General > Disable Fun Facts' setting in 'config.ts'.",
	"Despite the features that Hearthstone.js offers, it has comparatively few cards. This is because maintaining cards is a nightmare with how I constantly add breaking changes.",
	"Hearthstone.js <i>doesn't</i> support a lot of the new features that Hearthstone has released (2024 and onwards). This is because I have kinda lost interest in the original Hearthstone, and am only working on Hearthstone.js since it's fun.",
	"Hearthstone.js used to have localization support. It was removed since it wasn't integrated enough to be useful.",
	"The 'history' command, despite being hard to read, is <i>extremely</i> useful for figuring out what has happened. When learned, it should give you a good oversight of what has happened throughout the <i>entire</i> game.",

	// Other
	"Hearthstone.js is the project I am most proud of. I hope you enjoy it!",
	"Hearthstone.js has reached 15 stars on GitHub. Thanks for the support!",
	"Hearthstone.js is a hobby project, and so I can't guarantee that I'll have the time or energy to work on it. Expect months where nothing happens, and weeks where everything happens.",
	"English is my second language, so expect some typos, grammar errors, and (probably) most of all, punctuation errors. Please report them if you see any.",
	"I switched to Bun since it actually solved some issues I had. I don't know if Node.js was bugged, but with Bun I was able to re-add card reloading, for example.",
	"I have still not learned everything TypeScript has to offer. Only 2 days ago (at the time of writing), I discovered type guard functions, which were used in ad6394d to narrow down the type of the 'value' parameter in passives. If that doesn't mean anything to you, please accept this emoji of a bunny as an apology: 🐿️",
	"One of my philosophies with Hearthstone.js is to make it <i>incredibly</i> easy to add new stuff. I achieve this not only by making tools like the card creators, but through making the codebase highly modular and extendable.",
	"Check out Hearthstone.gd for a version of Hearthstone.js made in Godot. It is in very early stages of development and is currently stuck in limbo.",
	"There is another Hearthstone.py (not to be confused with Hearthstone.py V1 / V2) currently in development. It might not see the light of day, but it exists.",
	"Some of the things used in Hearthstone.js (the tags used for coloring, and the types for Vanilla cards), have been separated into their own projects. See 'chalk-tags' and '@hearthstonejs/vanillatypes' on npm.",
];

export const print = {
	/**
	 * Prints the "watermark" border.
	 */
	watermark() {
		game.interact.cls();
		let result = "";

		const versionDetail =
			game.player.detailedView ||
			game.isDebugSettingEnabled(game.config.debug.showCommitHash)
				? 4
				: 3;

		const eventEmojis = game.configuration.getCurrentEventEmojis();
		let eventEmojisText = eventEmojis.join("");
		if (eventEmojis.length > 0) {
			eventEmojisText += " ";
		}

		result += `HEARTHSTONE.JS ${eventEmojisText}V${game.info.versionString(versionDetail)}\n`;

		const { branch } = game.info.version();

		if (branch === "topic" && game.config.general.topicBranchWarning) {
			result +=
				"\n<yellow>WARNING: YOU ARE ON A TOPIC BRANCH. THIS VERSION IS NOT READY.</yellow>\n";
		}

		if (game.isEventActive(game.time.events.anniversary)) {
			result += `\n<b>[${game.time.year - 2022} year anniversary!]</b>\n`;
		}

		// Fun facts.
		if (!game.config.general.disableFunFacts) {
			// Cycle through the fun facts. If it has been seen, don't show it again.
			// Once all the fun facts have been shown, cycle through them again.
			let filteredFunFacts = funFacts.filter(
				(funFact) => !seenFunFacts.includes(funFact),
			);

			// If all the fun facts have been shown, show them again.
			if (filteredFunFacts.length === 0 && seenFunFacts.length > 0) {
				// If the fun fact ends with a dash, keep it in the list.
				// This is so that the fun facts that are cut off only appear once.
				seenFunFacts = seenFunFacts.filter((funFact: string) =>
					funFact.endsWith("-"),
				);

				filteredFunFacts = filteredFunFacts.filter(
					(funFact) => !seenFunFacts.includes(funFact),
				);
			}

			const funFact = game.lodash.sample(filteredFunFacts);
			if (funFact) {
				seenFunFacts.push(funFact);

				result += `<gray>(Fun Fact: ${funFact})</gray>`;
			}
		}

		console.log(boxen(parseTags(result), { padding: 0.5 }));
	},

	/**
	 * Prints some license info
	 *
	 * @param disappear If this is true, "This will disappear once you end your turn" will show up.
	 */
	license(disappear = true) {
		if (game.isDebugSettingEnabled(game.config.debug.hideLicense)) {
			return;
		}

		const { branch } = game.info.version();

		game.interact.cls();

		const version = `Hearthstone.js V${game.info.versionString(2)} | Copyright (C) 2022 | LunarTides`;
		console.log("|".repeat(version.length + 8));
		console.log(`||| ${version} |||`);
		console.log(
			`|||     This program is licensed under the GPL-3.0 license.  ${" ".repeat(branch.length)}|||`,
		);

		if (disappear) {
			console.log(
				`|||         This will disappear once you end your turn.      ${" ".repeat(branch.length)}|||`,
			);
		}

		console.log("|".repeat(version.length + 8));
	},

	/**
	 * Prints all the information you need to understand the game state
	 *
	 * @param player The player
	 */
	async gameState(player: Player, includeCardsInHand = true): Promise<void> {
		this.watermark();
		console.log();

		if (
			game.turn <= 2 &&
			!game.isDebugSettingEnabled(game.config.debug.hideLicense)
		) {
			this.license();
			console.log();
		}

		await this.playerStats(player);
		console.log();
		await this.board(player);
		console.log();
		await this.hand(player, includeCardsInHand);
	},

	/**
	 * Prints the player stats.
	 */
	async playerStats(currentPlayer: Player): Promise<void> {
		let finished = "";

		const doStat = async (callback: (player: Player) => Promise<string>) => {
			const player = await callback(currentPlayer);
			const opponent = await callback(currentPlayer.getOpponent());

			if (!player && !opponent) {
				return;
			}

			if (!player) {
				finished += `${opponent.split(":")[0]}: <italic gray>Nothing</italic gray> | ${opponent}`;
			} else if (opponent) {
				finished += `${player} | ${opponent}`;
			} else {
				finished += `${player} | ${player.split(":")[0]}: <italic gray>Nothing</italic gray>`;
			}

			finished += "\n";
		};

		const align = (text: string) => {
			const textSplit = game.lodash.initial(text.split("\n"));

			// Align the ':' in the first half
			const firstHalf = textSplit.map((line) => line.split("|")[0]);
			const firstHalfAligned = game.data.alignColumns(firstHalf, ":");

			// Align the ':' in the second half
			const secondHalf = textSplit.map((line) => line.split("|")[1]);
			const secondHalfAligned = game.data.alignColumns(secondHalf, ":");

			// Combine the two halves
			const newText = firstHalfAligned.map(
				(line, index) => `${line}|${secondHalfAligned[index]}`,
			);

			// Align the '|' in the final result
			const aligned = game.data.alignColumns(newText, "|");
			return aligned.join("\n");
		};

		const colorIf = game.color.if;
		const detail = (noDetail: string, detail: string) =>
			currentPlayer.detailedView ? detail : noDetail;
		const detailCard = async (card: Card) =>
			detail(card.colorFromRarity(), await card.readable());

		// Mana
		await doStat(
			async (player) =>
				`Mana: <cyan>${player.mana}</cyan> / <cyan>${player.emptyMana}</cyan>`,
		);

		// Health
		await doStat(
			async (player) =>
				`Health: <red>${player.health}</red> <gray>[${player.armor}]</gray> / <red>${player.maxHealth}</red>`,
		);

		// Deck Size
		await doStat(
			async (player) =>
				`Deck Size: <yellow>${player.deck.length}</yellow> & <yellow>${player.hand.length}</yellow>`,
		);

		// Hero Power
		await doStat(async (player) => {
			const heroPowerCost = colorIf(
				player.canUseHeroPower(),
				"cyan",
				`{${player.hero.heropower?.cost}}`,
			);

			return `Hero Power: ${heroPowerCost} ${detail(
				player.hero.name,
				(await player.hero.heropower?.readable())
					// Remove the mana cost from the readable version.
					// This gives the illusion that the code was well written :)
					?.replace(/\{.*?\} /, "") ?? "No hero power.",
			)}`;
		});

		// Weapon
		await doStat(async (player) => {
			if (!player.weapon) {
				return "";
			}

			return `Weapon: ${await detailCard(player.weapon)}`;
		});

		// Attack
		await doStat(async (player) => {
			// If the player doesn't have any attack, don't show the attack.
			if (player.attack <= 0) {
				return "";
			}

			return `Attack: <bright:green>${player.attack}</bright:green>`;
		});

		// Corpses
		await doStat(async (player) => {
			if (player.corpses <= 0 || !player.canUseCorpses()) {
				return "";
			}

			return `Corpses: <gray>${player.corpses}</gray>`;
		});

		// Quests
		await doStat(async (player) => {
			if (player.quests.length <= 0) {
				return "";
			}

			return `Quests: ${(
				await Promise.all(
					player.quests.map(
						async (q) =>
							`${await detailCard(q.card)} @ [${q.progress.join("/")}] (${q.type})`,
					),
				)
			).join(", ")}`;
		});

		// --- Finished ---
		console.log(
			boxen(align(parseTags(finished)), {
				padding: 0.5,
				title: "Stats",
				titleAlignment: "center",
			}),
		);
	},

	/**
	 * Prints the board for a specific player.
	 */
	async board(player: Player): Promise<void> {
		for (const plr of [game.player1, game.player2]) {
			let strbuilder = "";
			if (plr.board.length === 0) {
				strbuilder += "<gray>Empty</gray>";
			} else {
				for (const [index, card] of plr.board.entries()) {
					strbuilder += `${await card.readable(index + 1)}\n`;
				}

				// Remove trailing newline.
				strbuilder = strbuilder.slice(0, -1);
			}

			console.log(
				boxen(parseTags(strbuilder), {
					padding: 0.5,
					title: plr === player ? "Board (You)" : "Board (Opponent)",
					titleAlignment: "center",
				}),
			);
		}
	},

	/**
	 * Prints the hand of the specified player.
	 */
	async hand(player: Player, includeCards = true): Promise<void> {
		console.log(`--- ${player.getName()} (${player.heroClass})'s Hand ---`);

		const debugInfo = game.isDebugSettingEnabled(
			game.config.debug.additionalInfoInReadable,
		)
			? "(<gray>Debug Info -></gray> #id @uuid <gray>[tags]</gray>) "
			: "";

		// Add the help message
		console.log(
			`([index] <cyan>{Cost}</cyan> <b>Name</b> ${debugInfo}<bright:green>[attack / health]</bright:green> <yellow>(type)</yellow>)\n`,
		);

		if (includeCards) {
			for (const [index, card] of player.hand.entries()) {
				console.log(await card.readable(index + 1));
			}
		}
	},
};
