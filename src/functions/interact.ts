import { SentimentAI } from "@Game/ai.ts";
import { Card } from "@Game/card.ts";
import {
	commands,
	debugCommands,
	helpColumns,
	helpDebugColumns,
} from "@Game/commands.ts";
import type { Player } from "@Game/player.ts";
import {
	Ability,
	Alignment,
	Event,
	GameAttackReturn,
	GamePlayCardReturn,
	Keyword,
	type Target,
	type TargetFlags,
	TargetType,
	Type,
	UseLocationError,
} from "@Game/types.ts";
import { format } from "node:util";
import { Separator } from "@inquirer/core";
import { checkbox, confirm, number, select } from "@inquirer/prompts";
import boxen from "boxen";
import { parseTags } from "chalk-tags";
import readInput, { type InputConfig } from "./input";

const overrideConsole = {
	log: console.log.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
};

console.log = (...data) => {
	game.functions.interact.log(...data);
};

console.warn = (...data) => {
	game.functions.interact.logWarn(...data);
};

console.error = (...data) => {
	game.functions.interact.logError(...data);
};

// Exit on ctrl+c
process.on("uncaughtException", (error) => {
	if (error instanceof Error && error.name === "ExitPromptError") {
	} else {
		overrideConsole.error(error.stack);
		throw error;
	}
});

export const UILoopDefaultOptions = {
	callbackBefore: (() => Promise.resolve()) as () => Promise<void>,
	message: "Options" as string,
	seperatorBeforeBackButton: true as boolean,
	backButtonText: "Back" as string,
	default: undefined as number | undefined,
};

let seenFunFacts: string[] = [];
const selectValues: Record<string, any> = {};

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
	"There are example cards that show you how to make cards properly. They are found under the 'cards/Examples' folder.",
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
	"Hearthstone.js supports localization. Although there is a <i>lot</i> of text, and it changes constantly.",
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

const prompt = {
	/**
	 * A custom select prompt that allows transforming the array. This is mostly used internally, so don't worry about it too much.
	 *
	 * @param message The prompt.
	 * @param array The array it should ask the user to select from.
	 * @param options Any options.
	 * @param otherChoices Add choices other than the ones supplied from the array.
	 * @returns The answer that the user chose.
	 */
	// TODO: Rewrite this function. Holy crap...
	async customSelect(
		message: string,
		array: string[],
		options?: {
			arrayTransform:
				| ((
						i: number,
						element: string,
				  ) => Promise<{
						name?: string;
						value: string;
						addSeperatorBefore?: boolean;
						addSeperatorAfter?: boolean;
						disabled?: boolean;
				  }>)
				| undefined;
			hideBack: boolean;
			resetCursor?: boolean;
			default?: unknown;
		},
		...otherChoices: (
			| Separator
			| string
			| {
					name?: string;
					value: string;
					description?: string;
					disabled?: boolean;
			  }
			| false
		)[]
	) {
		const choices = [];
		for (const [i, element] of Object.entries(array)) {
			const choice = (await options?.arrayTransform?.(
				parseInt(i, 10),
				element,
			)) ?? {
				name: parseTags(element),
				value: i,
			};

			if (choice.addSeperatorBefore) {
				choices.push(new Separator());
			}

			choices.push(choice);

			if (choice.addSeperatorAfter) {
				choices.push(new Separator());
			}
		}

		if (!options?.hideBack) {
			choices.push(new Separator());
			choices.push({
				value: "Back",
			});
		}

		for (const element of otherChoices) {
			// Allow doing stuff like `allowAddAndDelete && "Add"` in choices.
			if (element === false || element === "") {
				continue;
			}

			if (element instanceof Separator) {
				choices.push(element);
				continue;
			}

			if (typeof element === "string") {
				choices.push({
					name: parseTags(element),
					value: element.toLowerCase(),
				});
				continue;
			}

			choices.push({
				...element,
				name: element.name && parseTags(element.name),
			});
		}

		const answer = await select({
			message,
			choices,
			default:
				options?.default ??
				(options?.resetCursor ? undefined : selectValues[message]),
			loop: false,
			pageSize: 15,
		});

		if (["back", "done", "cancel"].includes(answer.toLowerCase())) {
			// Go back to the first option. The next time.
			selectValues[message] =
				typeof choices?.[0] === "string" ? choices[0] : otherChoices[0];
		} else {
			// Remember the cursor position.
			selectValues[message] = answer;
		}

		return answer;
	},

	/**
	 * A custom select prompt that allows selecting from an enum array. This is mostly used internally, so don't worry about it too much.
	 *
	 * @param message The prompt.
	 * @param array The array it should ask the user to select from.
	 * @returns The answer that the user chose.
	 */
	async customSelectEnum<E extends string>(message: string, array: E[]) {
		return (await game.prompt.customSelect(message, array, {
			arrayTransform: async (i, element) => ({
				name: element,
				value: element,
			}),
			hideBack: false,
		})) as E;
	},

	async createUILoop(
		rawOptions: Partial<typeof UILoopDefaultOptions> = UILoopDefaultOptions,
		...choices: (
			| Separator
			| {
					name: string;
					description?: string;
					disabled?: boolean;
					defaultSound?: boolean;
					callback?: (value: number) => Promise<boolean>;
			  }
			| false
		)[]
	) {
		const options = {
			...UILoopDefaultOptions,
			...rawOptions,
		};

		// Filter out invalid choices.
		choices = choices.filter((choice) => choice !== false);

		while (true) {
			if (options.callbackBefore) {
				await options.callbackBefore();
			}

			// Find an existing back option.
			const backOption = choices.find(
				(choice) =>
					!(choice instanceof Separator) &&
					choice !== false &&
					choice.name === options.backButtonText,
			);

			const answer = await game.prompt.customSelect(
				options.message,
				[],
				{
					hideBack: true,
					arrayTransform: undefined,
					default: options.default ? options.default.toString() : undefined,
				},
				...choices.map((choice, i) => ({
					...choice,
					value: i.toString(),
				})),
				options.seperatorBeforeBackButton &&
					options.backButtonText &&
					new Separator(),
				!backOption &&
					options.backButtonText && {
						name: options.backButtonText,
						value: "back",
					},
			);

			const choseBack = answer === "back";
			if (choseBack && !backOption) {
				game.functions.audio.playSFX("ui.back");
				break;
			}

			const parsed = Number.parseInt(answer, 10);
			const choice = choices[parsed];
			if (choice instanceof Separator || choice === false) {
				throw new Error("Selected a seperator");
			}

			if (choice.defaultSound !== false) {
				if (choseBack) {
					game.functions.audio.playSFX("ui.back");
				} else {
					game.functions.audio.playSFX("ui.delve");
				}
			}

			const result = await choice.callback?.(parsed);
			if (result === false) {
				break;
			}
		}
	},

	/**
	 * Prompts the user to configure an array. Modifies the array directly.
	 *
	 * This is used by the Packager, and the Custom Card Creator, for their menus.
	 *
	 * @param array The array to configure.
	 * @param onLoop A function it should call at the start of each prompt.
	 * @returns If the array was changed. Use this as a dirty flag.
	 */
	async configureArray(array: string[], onLoop?: () => Promise<void>) {
		let dirty = false;

		await game.prompt.createUILoop(
			{
				message: "Configure Array",
				backButtonText: "Done",
				callbackBefore: async () => {
					await onLoop?.();
					console.log(JSON.stringify(array, null, 4));
					console.log();
				},
			},
			...array.map((element, i) => ({
				name: `Element ${i}`,
				callback: async (answer: number) => {
					const newValue = await game.input({
						message: "What will you change this value to?",
						default: array[answer],
					});

					array[answer] = newValue;
					dirty = true;
					return true;
				},
			})),
			new Separator(),
			{
				name: "New",
				callback: async () => {
					const value = await game.input({
						message: "Value.",
					});

					array.push(value);
					dirty = true;
					return true;
				},
			},
			{
				name: "Delete",
				defaultSound: false,
				callback: async () => {
					game.functions.audio.playSFX("ui.delete");

					array.pop();
					dirty = true;
					return true;
				},
			},
		);

		return dirty;
	},

	/**
	 * Prompts the user to configure an enum array. Modifies the array directly.
	 *
	 * This is used by the Packager, and the Custom Card Creator, for their menus.
	 *
	 * @param array The array to configure.
	 * @param enumType The enum itself.
	 * @param options Any options.
	 * @param onLoop A function it should call at the start of each prompt.
	 * @returns If the array was changed. Use this as a dirty flag.
	 */
	async configureArrayEnum(
		array: string[],
		enumType: any,
		options?: { maxSize: number | undefined; allowDuplicates: boolean },
		onLoop?: () => Promise<void>,
	) {
		let dirty = false;

		let allowEdit =
			options?.allowDuplicates ||
			Object.keys(enumType).filter((c) => !array.includes(c)).length > 0;
		let allowNew = allowEdit && array.length < (options?.maxSize ?? Infinity);

		await game.prompt.createUILoop(
			{
				message: "Configure Array",
				backButtonText: "Done",
				callbackBefore: async () => {
					await onLoop?.();
					console.log(JSON.stringify(array, null, 4));
					console.log();

					// Refresh
					allowEdit =
						options?.allowDuplicates ||
						Object.keys(enumType).filter((c) => !array.includes(c)).length > 0;
					allowNew = allowEdit && array.length < (options?.maxSize ?? Infinity);
				},
			},
			...array.map((element, i) => ({
				name: `Element ${i}`,
				callback: async (answer: number) => {
					if (!allowEdit) {
						return true;
					}

					const value = await game.prompt.customSelect(
						"Value",
						Object.keys(enumType).filter(
							(c) => options?.allowDuplicates || !array.includes(c),
						),
						{
							arrayTransform: async (i, element) => ({
								name: element,
								value: element,
							}),
							hideBack: false,
						},
					);

					if (value === "Back") {
						return true;
					}

					(array as unknown[])[answer] = value;
					dirty = true;
					return true;
				},
			})),
			new Separator(),
			{
				name: "New",
				disabled: !allowNew,
				defaultSound: false,
				callback: async () => {
					if (!allowNew) {
						game.functions.audio.playSFX("error");
						return true;
					}

					game.functions.audio.playSFX("ui.delve");

					let filtered: any = Object.keys(enumType).filter(
						(c) => options?.allowDuplicates || !array.includes(c),
					);

					await game.prompt.createUILoop(
						{
							message: "Value",
							callbackBefore: async () => {
								// Re-filter the array.
								filtered = Object.keys(enumType).filter(
									(c) => options?.allowDuplicates || !array.includes(c),
								);
							},
						},
						...filtered.map((element: any) => ({
							name: element,
							callback: async (answer: number) => {
								const value = filtered[answer];

								(array as unknown[]).push(value);
								dirty = true;
								return false;
							},
						})),
					);

					return true;
				},
			},
			{
				name: "Delete",
				defaultSound: false,
				callback: async () => {
					game.functions.audio.playSFX("ui.delete");

					array.pop();
					dirty = true;
					return true;
				},
			},
		);

		return dirty;
	},

	/**
	 * Prompts the user to configure an object. Modifies the object directly.
	 *
	 * This is used by the Packager, and the Custom Card Creator, for their menus.
	 *
	 * @param object The object to configure.
	 * @param allowAddingAndDeleting If it should allow adding and deleting elements from the object.
	 * @param onLoop A function it should call at the start of each prompt.
	 * @returns If the object was changed. Use this as a dirty flag.
	 */
	async configureObject(
		object: any,
		allowAddingAndDeleting = true,
		onLoop?: () => Promise<void>,
	) {
		let dirty = false;

		await game.prompt.createUILoop(
			{
				message: "Configure Object",
				backButtonText: "Done",
				callbackBefore: async () => {
					await onLoop?.();
					console.log(JSON.stringify(object, null, 4));
					console.log();
				},
			},
			...Object.keys(object).map((element) => ({
				name: element,
				callback: async (answer: number) => {
					const key = Object.keys(object)[answer];
					const value = object[key];

					if (Array.isArray(value)) {
						const changed = await game.prompt.configureArray(value, onLoop);

						// NOTE: I can't do `dirty ||= await game.prompt...` since if dirty is true, it won't evaluate the right side of the expression.
						// Learned that the hard way...
						dirty ||= changed;
						return true;
					} else if (game.lodash.isBoolean(value)) {
						const newValue = await game.prompt.customSelect(
							"What will you change this value to?",
							["True", "False"],
							{
								arrayTransform: async (i, element) => ({
									name: element,
									value: element.toLowerCase(),
								}),
								hideBack: false,
							},
						);

						object[key] = newValue === "true";
						dirty = true;
						return true;
					} else if (!Number.isNaN(parseInt(value, 10))) {
						const newValue = await number({
							message: "What will you change this value to?",
							default: value,
							step: "any",
						});

						object[key] = newValue;
						dirty = true;
						return true;
					} else if (game.lodash.isObject(value)) {
						const changed = await game.prompt.configureObject(
							value,
							allowAddingAndDeleting,
							onLoop,
						);

						// NOTE: I can't do `dirty ||= await game.prompt...` since if dirty is true, it won't evaluate the right side of the expression.
						// Learned that the hard way...
						dirty ||= changed;
						return true;
					}

					const newValue = await game.input({
						message: "What will you change this value to?",
						default: value,
					});

					object[key] = newValue;
					dirty = true;
					return true;
				},
			})),
			allowAddingAndDeleting && new Separator(),
			allowAddingAndDeleting && {
				name: "New",
				callback: async () => {
					const key = await game.input({
						message: "Key.",
					});
					const value = await game.input({
						message: "Value.",
					});

					object[key] = value;
					dirty = true;
					return true;
				},
			},
			allowAddingAndDeleting && {
				name: "Delete",
				callback: async () => {
					const key = await game.input({
						message: "Key.",
					});

					game.functions.audio.playSFX("ui.delete");

					delete object[key];
					dirty = true;
					return true;
				},
			},
		);

		return dirty;
	},

	/**
	 * Asks the player to supply a deck code.
	 *
	 * If no code was given, fill the players deck with 30 Sheep unless both;
	 * - Debug mode is disabled
	 * - The program is running on the stable branch
	 *
	 * @param player The player to ask
	 *
	 * @returns Success
	 */
	async deckcode(player: Player): Promise<boolean> {
		game.functions.interact.print.watermark();
		console.log();

		const { branch } = game.functions.info.version();

		/**
		 * If the test deck (30 Sheep) should be allowed.
		 * I want to be able to test without debug mode on a non-stable branch
		 */
		const allowTestDeck: boolean =
			game.isDebugSettingEnabled(game.config.debug.allowTestDeck) ||
			branch !== "stable";

		const debugStatement = allowTestDeck
			? " <gray>(Leave this empty for a test deck)</gray>"
			: "";
		const deckcode = await game.input({
			message: parseTags(
				`Player ${player.id + 1}, please type in your deckcode${debugStatement}`,
			),
		});

		let result = true;

		if (deckcode.length > 0) {
			game.interest(`${player.getName()} chose deck code: ${deckcode}...`);
			result = Boolean(await game.functions.deckcode.import(player, deckcode));

			if (result) {
				game.interest(`${player.getName()} chose deck code: ${deckcode}...OK`);
			} else {
				game.interest(
					`${player.getName()} chose deck code: ${deckcode}...FAIL`,
				);
			}
		} else {
			if (!allowTestDeck) {
				// Give error message
				await game.pause("<red>Please enter a deckcode!</red>\n");
				return false;
			}

			game.interest(`${player.getName()} chose debug deck...`);

			// Debug mode is enabled, use the 30 Sheep debug deck.
			while (player.deck.length < 30) {
				const sheep = await Card.create(
					game.ids.Official.builtin.sheep[0],
					player,
					true,
				);
				player.addToDeck(sheep);
			}

			game.interest(`${player.getName()} chose debug deck...OK`);
		}

		return result;
	},

	/**
	 * Asks the player to choose an option.
	 *
	 * @param times The amount of times to ask
	 * @param prompts [prompt, callback]
	 */
	async chooseOne(
		times: number,
		...prompts: Array<[string, () => Promise<void>]>
	): Promise<void> {
		// TODO: Add event broadcast.
		for (let i = 0; i < times; i++) {
			const queue = game.player.inputQueueNext();
			if (queue !== undefined) {
				const choice = parseInt(queue, 10) - 1;

				// Call the callback function.
				await prompts[choice][1]();
				continue;
			}

			if (game.player.ai) {
				const aiChoice = await game.player.ai.chooseOne(
					prompts.map((p) => p[0]),
				);
				if (aiChoice === undefined) {
					continue;
				}

				// Call the callback function
				await prompts[aiChoice][1]();
				continue;
			}

			await game.functions.interact.print.gameState(game.player);
			console.log();

			const value = await game.prompt.customSelect(
				`Choose ${times - i}`,
				prompts.map((obj) => obj[0]),
				{
					arrayTransform: undefined,
					hideBack: true,
				},
			);

			const choice = parseInt(value, 10);

			// Call the callback function.
			await prompts[choice][1]();
		}
	},

	/**
	 * Asks the `player` a `prompt`, show them a list of `answers` and make them choose one
	 *
	 * @param player The player to ask
	 * @param prompt The prompt to show
	 * @param answers The answers to choose from
	 *
	 * @returns Chosen
	 */
	async chooseFromList(
		player: Player,
		prompt: string,
		answers: string[],
	): Promise<string> {
		const queue = game.player.inputQueueNext();
		if (queue !== undefined) {
			const choice = parseInt(queue, 10) - 1;

			return answers[choice];
		}

		await game.functions.interact.print.gameState(player);

		if (player.ai) {
			const aiChoice = await player.ai.chooseFromList(prompt, answers);
			if (!aiChoice) {
				// Code, expected, actual
				throw new Error(
					`AI Error: expected: ${aiChoice}, got: some number. Error Code: AiQuestionReturnInvalidAtQuestionFunction`,
				);
			}

			return aiChoice;
		}

		const choice = await game.prompt.customSelect(prompt, answers, {
			arrayTransform: undefined,
			hideBack: true,
		});
		return answers[parseInt(choice, 10)];
	},

	/**
	 * Asks the user a yes/no question
	 *
	 * @param prompt The prompt to ask
	 * @param player Used to check if the player is an ai
	 *
	 * @returns `true` if Yes / `false` if No
	 */
	async yesNo(prompt: string, player?: Player): Promise<boolean> {
		const queue = game.player.inputQueueNext();
		if (queue !== undefined) {
			return queue === "y";
		}

		if (player?.ai) {
			return await player.ai.yesNoQuestion(prompt);
		}

		console.log();

		return confirm({
			message: parseTags(prompt),
			theme: {
				prefix: "",
				style: {
					message: (text: string) => text,
				},
			},
		});
	},

	/**
	 * Like `target` but restricts the user to selecting heroes.
	 *
	 * The advantage of this function is that it returns `Player | false` instead of `Target | false`.
	 */
	async targetPlayer(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags,
		shouldBeDisabled?: (target: Player) => Promise<boolean>,
	): Promise<Player | null> {
		return (await this.target(
			prompt,
			card,
			{
				...flags,
				targetType: TargetType.Player,
			},
			shouldBeDisabled as any,
		)) as Player | null;
	},

	/**
	 * Like `target` but restricts the user to selecting minions.
	 *
	 * The advantage of this function is that it returns `Card | null` instead of `Target | null`.
	 */
	async targetCard(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags = {},
		shouldBeDisabled?: (target: Card) => Promise<boolean>,
	): Promise<Card | null> {
		return (await this.target(
			prompt,
			card,
			{
				...flags,
				targetType: TargetType.Card,
			},
			shouldBeDisabled as any,
		)) as Card | null;
	},

	/**
	 * #### You might want to use `targetPlayer` or `targetCard` instead.
	 *
	 * Asks the user a `prompt`, the user can then select a minion or hero.
	 * Broadcasts the `TargetSelectionStarts` and the `TargetSelected` event.
	 *
	 * @param prompt The prompt to ask
	 * @param card The card that called this function.
	 * @param forceSide Force the user to only be able to select minions / the hero of a specific side
	 * @param forceClass Force the user to only be able to select a minion or a hero
	 * @param flags Change small behaviours ["allowLocations" => Allow selecting location, ]
	 * @param shouldBeDisabled If this callback returns true, the target cannot be selected.
	 *
	 * @returns The card or hero chosen
	 */
	async target(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags = {},
		shouldBeDisabled?: (target: Target) => Promise<boolean>,
	): Promise<Target | null> {
		await game.event.broadcast(
			Event.TargetSelectionStarts,
			[prompt, card, flags],
			game.player,
		);

		const target = await this._target(prompt, card, flags, shouldBeDisabled);

		if (target) {
			await game.event.broadcast(
				Event.TargetSelected,
				[card, target],
				game.player,
			);
		}

		return target;
	},

	/**
	 * # USE `target` INSTEAD.
	 */
	async _target(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags = {},
		shouldBeDisabled?: (target: Target) => Promise<boolean>,
	): Promise<Target | null> {
		// If the player is forced to select a target, select that target.
		if (game.player.forceTarget) {
			return game.player.forceTarget;
		}

		// Add spell damage in prompt
		const spellDamageRegex = /\$(\d+)/g;
		const matches = spellDamageRegex.exec(prompt);
		matches?.splice(0, 1);

		let newPrompt = prompt;

		if (matches) {
			for (const match of matches) {
				newPrompt = prompt.replace(
					match,
					(parseInt(match, 10) + game.player.spellDamage).toString(),
				);
			}
		}

		newPrompt = prompt.replaceAll(spellDamageRegex, "$1");

		// If the player is an ai, hand over control to the ai.
		if (game.player.ai) {
			return await game.player.ai.promptTarget(newPrompt, card, flags);
		}

		const choices = [];
		if (
			flags.alignment === undefined ||
			flags.alignment === Alignment.Friendly
		) {
			if (
				flags.targetType === undefined ||
				flags.targetType === TargetType.Player
			) {
				choices.push({
					name: "Friendly Player",
					value: "pf",
					disabled: (await shouldBeDisabled?.(game.player)) ?? false,
				});
			}

			if (
				(!flags.targetType || flags.targetType === TargetType.Card) &&
				game.player.board.length > 0
			) {
				for (const [i, card] of Object.entries(game.player.board)) {
					choices.push({
						name: parseTags(await card.readable()),
						value: `f${i}`,
						description: `${card.name} on your side of the board.`,
						disabled: (await shouldBeDisabled?.(card)) ?? false,
					});
				}
			}
		}
		if (flags.alignment === undefined || flags.alignment === Alignment.Enemy) {
			if (
				flags.targetType === undefined ||
				flags.targetType === TargetType.Player
			) {
				if (choices.length > 0) {
					choices.push(new Separator());
				}

				choices.push({
					name: "Enemy Player",
					value: "pe",
					disabled: (await shouldBeDisabled?.(game.opponent)) ?? false,
				});
			}

			if (
				(!flags.targetType || flags.targetType === TargetType.Card) &&
				game.opponent.board.length > 0
			) {
				for (const [i, card] of Object.entries(game.opponent.board)) {
					choices.push({
						name: parseTags(await card.readable()),
						value: `e${i}`,
						description: `${card.name} on the opponent's side of the board.`,
						disabled: (await shouldBeDisabled?.(card)) ?? false,
					});
				}
			}
		}

		choices.push(new Separator(), {
			value: "Back",
		});

		while (true) {
			let target: string;

			// Handle input queue.
			const queue = game.player.inputQueueNext();
			if (queue !== undefined) {
				target = queue;
			} else {
				console.log();

				target = await game.prompt.customSelect(
					newPrompt,
					[],
					{
						hideBack: true,
						arrayTransform: undefined,
						// TODO: Consider resetting the cursor here.
						//resetCursor: true,
					},
					...choices,
				);
			}

			// Player chose to go back
			if (target === "Back") {
				// This should always be safe.
				return null;
			}

			// If the player chose to target a player, it will ask which player.
			if (target.startsWith("p") && flags.targetType !== TargetType.Card) {
				if (target === "pf") {
					return game.player;
				}

				if (target === "pe") {
					return game.opponent;
				}

				throw new Error("Targeted invalid player.");
			}

			// From this point, the player has chosen a minion.

			/**
			 * This is the resulting minion that the player chose, if any.
			 */
			let minion: Card;

			if (target[0] === "f") {
				minion = game.player.board[parseInt(target[1], 10)];
			} else {
				minion = game.opponent.board[parseInt(target[1], 10)];
			}

			// If the minion has elusive, and the card that called this function is a spell or heropower.
			if (
				(card?.type === Type.Spell ||
					card?.type === Type.HeroPower ||
					flags.forceElusive) &&
				minion.hasKeyword(Keyword.Elusive)
			) {
				await game.pause(
					"<red>Can't be targeted by Spells or Hero Powers.</red>\n",
				);
				continue;
			}

			// If the minion has stealth, don't allow the opponent to target it.
			if (minion.hasKeyword(Keyword.Stealth) && game.player !== minion.owner) {
				await game.pause("<red>This minion has stealth.</red>\n");
				continue;
			}

			// If the minion is a location, don't allow it to be selected unless the `allowLocations` flag was set.
			if (minion.type === Type.Location && !flags.allowLocations) {
				await game.pause("<red>You cannot target location cards.</red>\n");
				continue;
			}

			return minion;
		}
	},

	/**
	 * Asks the user to select a location card to use, and activate it.
	 *
	 * @returns Success
	 */
	async useLocation(): Promise<UseLocationError> {
		const locations = game.player.board.filter((m) => m.type === Type.Location);
		if (locations.length <= 0) {
			return UseLocationError.NoLocationsFound;
		}

		const location = await this.targetCard(
			"Which location do you want to use?",
			undefined,
			{
				alignment: Alignment.Friendly,
				allowLocations: true,
			},
			async (target) => target.type !== Type.Location || target.cooldown > 0,
		);

		if (!location) {
			return UseLocationError.Refund;
		}

		if (location.type !== Type.Location) {
			return UseLocationError.InvalidType;
		}

		if (location.cooldown > 0) {
			return UseLocationError.Cooldown;
		}

		if ((await location.trigger(Ability.Use)) === Card.REFUND) {
			return UseLocationError.Refund;
		}

		if (location.durability === undefined) {
			throw new Error("Location card's durability is undefined");
		}

		location.durability -= 1;
		location.cooldown = location.backups.init.cooldown;
		return UseLocationError.Success;
	},

	/**
	 * Asks the player to mulligan their cards
	 *
	 * @param player The player to ask
	 *
	 * @returns The cards that were mulligan'd
	 */
	async mulligan(player: Player): Promise<Card[]> {
		await game.functions.interact.print.gameState(player, false);

		let toMulligan: Card[];

		if (player.ai) {
			toMulligan = await player.ai.mulligan();
		} else {
			const choices = [];

			for (const [i, card] of Object.entries(player.hand)) {
				// Don't allow mulliganing the coin.
				if (card.id === game.ids.Official.builtin.the_coin[0]) {
					continue;
				}

				const index = parseInt(i, 10);

				choices.push({
					name: parseTags(await card.readable(index + 1)),
					value: card,
				});
			}

			toMulligan = await checkbox({
				message: "Choose cards to mulligan.",
				choices,
				loop: false,
				pageSize: 15,
			});
		}

		await player.mulligan(toMulligan);
		return toMulligan;
	},

	/**
	 * Asks the current player a `prompt` and shows 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
	 *
	 * @param prompt The prompt to ask the user
	 *
	 * @returns The card chosen
	 */
	async dredge(prompt = "Choose a card to Dredge:"): Promise<Card | undefined> {
		// Look at the bottom three cards of the deck and put one on the top.
		const cards = game.player.deck.slice(0, 3);
		if (cards.length <= 0) {
			return undefined;
		}

		const queue = game.player.inputQueueNext();
		if (queue !== undefined) {
			const card = cards[parseInt(queue, 10) - 1];

			game.functions.util.remove(game.player.deck, card);
			game.player.addToDeck(card);

			return card;
		}

		// Check if ai
		if (game.player.ai) {
			const card = await game.player.ai.dredge(cards);
			if (!card) {
				return undefined;
			}

			// Removes the selected card from the players deck.
			game.functions.util.remove(game.player.deck, card);
			game.player.addToDeck(card);

			return card;
		}

		await game.functions.interact.print.gameState(game.player);
		console.log();

		const chosen = await game.prompt.customSelect(
			prompt,
			await game.functions.card.readables(cards),
			{
				arrayTransform: undefined,
				hideBack: true,
			},
		);

		const card = cards[parseInt(chosen, 10)];

		// Removes the selected card from the players deck.
		game.functions.util.remove(game.player.deck, card);
		game.player.addToDeck(card);

		return card;
	},

	/**
	 * Asks the user a "prompt", show them "amount" cards. The cards are chosen from "cards".
	 *
	 * @param prompt The prompt to ask
	 * @param cards The cards to choose from
	 * @param filterClassCards If it should filter away cards that do not belong to the player's class. Keep this at default if you are using `Card.getAll()`, disable this if you are using either player's deck / hand / graveyard / etc...
	 * @param amount The amount of cards to show
	 *
	 * @returns The card chosen.
	 */
	async discover(
		prompt: string,
		cards: Card[] = [],
		filterClassCards = true,
		amount = 3,
	): Promise<Card | undefined> {
		if (filterClassCards) {
			cards = cards.filter((card) =>
				game.functions.card.validateClasses(
					card.classes,
					game.player.heroClass,
				),
			);
		}

		cards = game.lodash.sampleSize(cards, amount);

		const queue = game.player.inputQueueNext();
		if (queue !== undefined) {
			const card = cards[parseInt(queue, 10) - 1];

			return card.perfectCopy();
		}

		if (game.player.ai) {
			return await game.player.ai.discover(cards);
		}

		const choice = await game.prompt.customSelect(
			prompt,
			await game.functions.card.readables(cards),
			{
				arrayTransform: undefined,
				hideBack: true,
			},
		);

		const card = cards[parseInt(choice, 10)];
		return card.perfectCopy();
	},

	/**
	 * DO NOT CALL THIS FUNCTION.
	 *
	 * Asks the user to attack a minion or hero. Used in the gameloop.
	 *
	 * @returns Cancel | Success
	 */
	async gameloopAttack(): Promise<-1 | boolean | Card> {
		let attacker: Target | -1 | null;
		let target: Target | -1 | null;

		if (game.player.ai) {
			let aiSelections: Array<-1 | Target> = [];

			if (game.player.ai instanceof SentimentAI) {
				const alternativeModel = `legacyAttack${game.config.ai.sentiment.attackModel}`;

				// Run the correct ai attack model
				const model = game.player.ai[alternativeModel as keyof SentimentAI];
				aiSelections = model
					? (model as () => Array<-1 | Target>)()
					: await game.player.ai.attack();
			} else {
				// Simulation AI.
				const result = await game.player.ai.attack();
				aiSelections = [result.attacker, result.target];
			}

			attacker = aiSelections[0];
			target = aiSelections[1];

			if (attacker === -1 || target === -1) {
				return -1;
			}

			if (attacker === null || target === null) {
				return false;
			}
		} else {
			attacker = await this.target(
				"Which target do you want to attack with?",
				undefined,
				{ alignment: Alignment.Friendly },
				async (target: Target) => {
					if (target instanceof Card) {
						return !target.canAttack();
					}

					return !target.canActuallyAttack();
				},
			);

			if (!attacker) {
				return false;
			}

			target = await this.target(
				"Which target do you want to attack?",
				undefined,
				{ alignment: Alignment.Enemy },
				async (target: Target) => !target.canBeAttacked(),
			);

			if (!target) {
				return false;
			}
		}

		const errorCode = await game.attack(attacker, target);

		const ignore = [GameAttackReturn.DivineShield];
		if (errorCode === GameAttackReturn.Success || ignore.includes(errorCode)) {
			return true;
		}

		let error: string;

		switch (errorCode) {
			case GameAttackReturn.Taunt: {
				error = "There is a minion with taunt in the way";
				break;
			}

			case GameAttackReturn.Stealth: {
				error = "That minion has stealth";
				break;
			}

			case GameAttackReturn.Frozen: {
				error = "That minion is frozen";
				break;
			}

			case GameAttackReturn.PlayerNoAttack: {
				error = "You don't have any attack";
				break;
			}

			case GameAttackReturn.CardNoAttack: {
				error = "That minion has no attack";
				break;
			}

			case GameAttackReturn.PlayerHasAttacked: {
				error = "Your hero has already attacked this turn";
				break;
			}

			case GameAttackReturn.CardHasAttacked: {
				error = "That minion has already attacked this turn";
				break;
			}

			case GameAttackReturn.Exhausted: {
				error = "That minion is exhausted";
				break;
			}

			case GameAttackReturn.CantAttackHero: {
				error = "That minion cannot attack heroes";
				break;
			}

			case GameAttackReturn.Immune: {
				error = "That minion is immune";
				break;
			}

			case GameAttackReturn.Dormant: {
				error = "That minion is dormant";
				break;
			}

			case GameAttackReturn.Titan: {
				error = "That minion has titan abilities that hasn't been used";
				break;
			}

			default: {
				error = format(
					"An unknown error occurred. Error code: UnexpectedAttackingResult@%s",
					errorCode,
				);

				break;
			}
		}

		console.log("<red>%s.</red>", game.translate(error));
		await game.pause("");
		return false;
	},
};

const print = {
	/**
	 * Prints the "watermark" border.
	 */
	watermark() {
		game.functions.interact.cls();
		let result = "";

		const versionDetail =
			game.player.detailedView ||
			game.isDebugSettingEnabled(game.config.debug.showCommitHash)
				? 4
				: 3;

		const eventEmojis = game.functions.util.getCurrentEventEmojis();
		let eventEmojisText = eventEmojis.join("");
		if (eventEmojis.length > 0) {
			eventEmojisText += " ";
		}

		result += `HEARTHSTONE.JS ${eventEmojisText}V${game.functions.info.versionString(versionDetail)}\n`;

		const { branch } = game.functions.info.version();

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

				result += format(
					game.translate("<gray>(Fun Fact: %s)</gray>"),
					game.translate(funFact),
				);
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

		const { branch } = game.functions.info.version();

		game.functions.interact.cls();

		const version = `Hearthstone.js V${game.functions.info.versionString(2)} | Copyright (C) 2022 | LunarTides`;
		console.log("|".repeat(version.length + 8));
		console.log("||| %s |||", version);
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
			const firstHalfAligned = game.functions.util.alignColumns(firstHalf, ":");

			// Align the ':' in the second half
			const secondHalf = textSplit.map((line) => line.split("|")[1]);
			const secondHalfAligned = game.functions.util.alignColumns(
				secondHalf,
				":",
			);

			// Combine the two halves
			const newText = firstHalfAligned.map(
				(line, index) => `${line}|${secondHalfAligned[index]}`,
			);

			// Align the '|' in the final result
			const aligned = game.functions.util.alignColumns(newText, "|");
			return aligned.join("\n");
		};

		const colorIf = game.functions.color.if;
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
		console.log("--- %s (%s)'s Hand ---", player.getName(), player.heroClass);

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

export const interactFunctions = {
	/**
	 * Prompt related functions.
	 */
	prompt,

	/**
	 * Print related functions.
	 */
	print,

	/**
	 * Returns if the input is a command to exit / go back.
	 */
	isInputExit(input: string): boolean {
		return ["exit", "stop", "quit", "back", "close"].includes(
			input.toLowerCase(),
		);
	},

	/**
	 * Clears the screen.
	 */
	cls(): void {
		if (game?.noOutput) {
			return;
		}

		console.clear();
		process.stdout.write("\u001Bc");
	},

	/**
	 * Shows `status...`, calls `callback`, then adds 'OK' or 'FAIL' to the end of that line depending on the result the callback
	 *
	 * @param status The status to show.
	 * @param callback The callback to call.
	 *
	 * @returns The return value of the callback.
	 */
	async withStatus(
		status: string,
		callback: () => Promise<boolean>,
	): Promise<boolean> {
		process.stdout.write(`${status}...`);
		const success = await callback();

		const message = success ? "OK" : "FAIL";
		process.stdout.write(`\r\u001B[K${status}...${message}\n`);

		return success;
	},

	/**
	 * Ask the user a question and returns their answer
	 *
	 * @param q The question to ask
	 * @param overrideNoInput If this is true, it overrides `game.noInput`. Only use this when debugging.
	 * @param useInputQueue If it should use the player's input queue
	 *
	 * @returns What the user answered
	 */
	async input(
		options: InputConfig & {
			overrideNoInput?: boolean;
			ignoreInputQueue?: boolean;
		},
	): Promise<string> {
		const wrapper = async (text: string) => {
			await game.event.broadcast(Event.Input, text, game.player);
			return text;
		};

		if (game.noOutput) {
			options.message = "";
		}

		if (game.noInput && options.overrideNoInput !== true) {
			return wrapper("");
		}

		options.message = game.translate(options.message);
		options.message = parseTags(options.message);

		// Let the game make choices for the user
		if (options.ignoreInputQueue !== true) {
			const queue = game.player.inputQueueNext();
			if (queue !== undefined) {
				return wrapper(queue);
			}
		}

		return wrapper((await readInput(options)) as string);
	},

	/**
	 * Helper function for the `console.log` functions. Don't use.
	 */
	_logWrapper(callback: (...data: any) => void, ...data: any): void {
		if (game.noOutput) {
			return;
		}

		const newData = data.map((i: any) =>
			typeof i === "string" ? parseTags(game.translate(i)) : i,
		);

		callback(...newData);
	},

	/**
	 * Wrapper for console.log
	 */
	log(...data: any): void {
		this._logWrapper(overrideConsole.log, ...data);
	},

	/**
	 * Wrapper for console.error
	 */
	logError(...data: any): void {
		this._logWrapper(overrideConsole.error, ...data);
	},

	/**
	 * Wrapper for console.warn
	 */
	logWarn(...data: any): void {
		this._logWrapper(overrideConsole.warn, ...data);
	},

	/**
	 * Tries to run `cmd` as a command. If it fails, return -1
	 *
	 * @param cmd The command
	 * @param flags Some flags to pass to the commands
	 *
	 * @returns A string if "echo" is false
	 */
	async processCommand(
		cmd: string,
		flags?: { echo?: boolean; debug?: boolean },
	): Promise<boolean | string | -1> {
		const args = cmd.split(" ");
		const name = args.shift()?.toLowerCase();
		if (!name) {
			console.log("<red>Invalid command.</red>");
			await game.pause("");
			return false;
		}

		const getReturn = (result: unknown) => {
			if (typeof result === "string" || result === -1) {
				return result as string | -1;
			}

			return true;
		};

		const commandName = Object.keys(commands).find((cmd) =>
			cmd.startsWith(name),
		);

		if (commandName) {
			const command = commands[commandName];
			const result = await command(args, flags);
			return getReturn(result);
		}

		if (!name.startsWith(game.config.debug.commandPrefix)) {
			return -1;
		}

		const debugName = name.slice(1);

		const debugCommandName = Object.keys(debugCommands).find((cmd) =>
			cmd.startsWith(debugName),
		);

		if (debugCommandName) {
			if (!game.isDebugSettingEnabled(game.config.debug.commands)) {
				await game.pause(
					"<red>You are not allowed to use this command.</red>\n",
				);
				return false;
			}

			const command = debugCommands[debugCommandName];
			const result = await command(args, flags);
			return getReturn(result);
		}

		return -1;
	},

	/**
	 * Tries to handle `input` as a command. If it fails, try to play the card with the index of `input`.
	 *
	 * @param input The user input
	 *
	 * @returns The return value of `game.playCard`
	 */
	async _gameloopHandleInput(input: string): Promise<GamePlayCardReturn> {
		if ((await this.processCommand(input)) !== -1) {
			return GamePlayCardReturn.Success;
		}

		const parsedInput = parseInt(input, 10);

		const card = game.player.hand[parsedInput];
		if (!card) {
			return GamePlayCardReturn.Invalid;
		}

		// FIXME: The outcast ability isn't triggered when calling `game.play` manually.
		if (parsedInput === game.player.hand.length || parsedInput === 1) {
			await card.trigger(Ability.Outcast);
		}

		const result = await game.play(card, game.player);
		if (result === GamePlayCardReturn.Success) {
			game.functions.audio.playSFX("game.playCard", { info: { card } });
		}

		return result;
	},

	/**
	 * Show the game state and asks the user for an input which is put into `gameloopLogic`.
	 *
	 * This is the core of the game loop.
	 *
	 * @returns Success | Ignored error code | The return value of doTurnLogic
	 */
	async gameloop(): Promise<boolean | string | GamePlayCardReturn> {
		await game.event.tick(Event.Dummy, undefined, game.player);

		if (game.player.ai) {
			console.log("The AI is thinking...");
			const rawInput = await game.player.ai.gameloop();
			if (!rawInput) {
				return false;
			}

			// TODO: Remove.
			// console.log("\n<b>Best Move</b>:");
			// console.log(rawInput);
			// await game.pause();

			const input =
				rawInput instanceof Card
					? (game.player.hand.indexOf(rawInput) + 1).toString()
					: rawInput;

			const turn = await this._gameloopHandleInput(input);

			await game.event.broadcast(Event.Input, input, game.player);
			return turn;
		}

		let user: string = "";

		const oldInterface = async () => {
			await game.functions.interact.print.gameState(game.player);
			console.log("");

			user = await game.input({ message: "Which card do you want to play? " });

			if (!Number.isNaN(parseInt(user, 10))) {
				user = (parseInt(user, 10) - 1).toString();
			}
		};

		if (game.config.advanced.gameloopUseOldUserInterface) {
			await oldInterface();
		} else {
			const cards = await game.functions.card.readables(game.player.hand);
			await game.prompt.createUILoop(
				{
					message: "Which card do you want to play?",
					backButtonText: "",
					callbackBefore: async () => {
						await game.functions.interact.print.gameState(game.player, false);
					},
				},
				...cards.map((readable) => ({
					name: readable,
					defaultSound: false,
					callback: async (answer: number) => {
						user = answer.toString();
						return false;
					},
				})),
				cards.length > 0 && new Separator(),
				{
					name: "Commands",
					callback: async () => {
						const debugCommandsDisabled = !game.isDebugSettingEnabled(
							game.config.debug.commands,
						);

						// TODO: Disable hero power if the player can't use their hero power. Do this to use, titan.
						const cmds = game.functions.util.alignColumns(
							helpColumns
								.filter((c) => !c.startsWith("(name)"))
								.map((c) => c[0].toUpperCase() + c.slice(1)),
							"-",
						);
						const debugCmds = game.functions.util.alignColumns(
							helpDebugColumns
								.filter((c) => !c.startsWith("(name)"))
								.map((c) => c[0].toUpperCase() + c.slice(1)),
							"-",
						);

						await game.prompt.createUILoop(
							{
								message: "Which command do you want to run?",
							},
							...cmds.map((c) => ({
								name: c,
								callback: async (answer: number) => {
									user = cmds[answer].toLowerCase();
									return false;
								},
							})),
							new Separator(),
							...debugCmds.map((c) => ({
								name: c,
								disabled: debugCommandsDisabled,
								callback: async (answer: number) => {
									// Account for the other choices.
									answer -= cmds.length + 1;

									const command = debugCmds[answer].split(" ")[0].toLowerCase();
									user = game.config.debug.commandPrefix + command;

									// Handle commands with arguments.
									// TODO: Use `search` for give.
									if (["give", "eval"].includes(command)) {
										await game.functions.interact.print.gameState(game.player);
										console.log();

										const args = await game.input({
											message: user,
										});

										user += ` ${args}`;
										return false;
									}

									return false;
								},
							})),
						);

						// If the user hasn't chosen anything, keep going.
						if (!user) {
							return true;
						}

						return false;
					},
				},
				{
					name: "Type in",
					description:
						"Type in the command instead of using the interface. (Old behavior)",
					callback: async () => {
						await oldInterface();
						return false;
					},
				},
			);
		}

		const returnValue = await this._gameloopHandleInput(user);

		// If there were no errors, return true.
		if (returnValue === GamePlayCardReturn.Success) {
			return returnValue;
		}

		let error: string;

		// Get the card
		const card = game.player.hand[parseInt(user, 10)];
		const cost = card ? card.costType : "mana";

		// Error Codes
		switch (returnValue) {
			case GamePlayCardReturn.Cost: {
				error = `Not enough ${cost}`;
				break;
			}

			case GamePlayCardReturn.Counter: {
				error = "Your card has been countered";
				break;
			}

			case GamePlayCardReturn.Space: {
				error = `You can only have ${game.config.general.maxBoardSpace} minions on the board`;
				break;
			}

			case GamePlayCardReturn.Invalid: {
				error = "Invalid card";
				break;
			}

			// Ignore these error codes
			case GamePlayCardReturn.Refund:
			case GamePlayCardReturn.Magnetize:
			case GamePlayCardReturn.Traded:
			case GamePlayCardReturn.Forged:
			case GamePlayCardReturn.Colossal: {
				return returnValue;
			}

			default: {
				error = `An unknown error occurred. Error code: UnexpectedDoTurnResult@${returnValue as string}`;
				break;
			}
		}

		game.functions.audio.playSFX("error");
		await game.pause(`<red>${error}.</red>\n`);

		return false;
	},
};
