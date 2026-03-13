import { SentimentAI } from "@Game/ai.ts";
import { Card } from "@Game/card.ts";
import type { Player } from "@Game/player.ts";
import {
	Ability,
	Alignment,
	Event,
	GameAttackReturn,
	Keyword,
	type Target,
	type TargetFlags,
	TargetType,
	Type,
	UseLocationError,
} from "@Game/types.ts";
import { Separator } from "@inquirer/core";
import { checkbox, confirm, number, select } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";

export const UILoopDefaultOptions = {
	callbackBefore: (() => Promise.resolve()) as () => Promise<void>,
	callbackAfter: (() => Promise.resolve()) as (
		result?: boolean,
	) => Promise<void>,
	message: "Options" as string,
	seperatorBeforeBackButton: true as boolean,
	backButtonText: "Back" as string,
	default: undefined as number | undefined,
	dynamicChoices: false as boolean,
};

const selectValues: Record<string, any> = {};

export const prompt = {
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
		choicesGenerator: () => Promise<
			(
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
		>,
	) {
		const options = {
			...UILoopDefaultOptions,
			...rawOptions,
		};

		let choices = await choicesGenerator();

		// Filter out invalid choices.
		choices = choices.filter((choice) => choice !== false);

		while (true) {
			if (options.callbackBefore) {
				await options.callbackBefore();
			}

			if (options.dynamicChoices) {
				choices = await choicesGenerator();

				// Filter out invalid choices.
				choices = choices.filter((choice) => choice !== false);
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
				game.audio.playSFX("ui.back");
				break;
			}

			const parsed = Number.parseInt(answer, 10);
			const choice = choices[parsed];
			if (choice instanceof Separator || choice === false) {
				throw new Error("Selected a seperator");
			}

			if (choice.defaultSound !== false) {
				if (choseBack) {
					game.audio.playSFX("ui.back");
				} else {
					game.audio.playSFX("ui.delve");
				}
			}

			const result = await choice.callback?.(parsed);

			if (options.callbackAfter) {
				await options.callbackAfter(result);
			}

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
				dynamicChoices: true,
				callbackBefore: async () => {
					await onLoop?.();
					console.log(JSON.stringify(array, null, 4));
					console.log();
				},
			},
			async () => [
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
						game.audio.playSFX("ui.delete");

						array.pop();
						dirty = true;
						return true;
					},
				},
			],
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
				dynamicChoices: true,
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
			async () => [
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
							game.audio.playSFX("error");
							return true;
						}

						game.audio.playSFX("ui.delve");

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
							async () => [
								...filtered.map((element: any) => ({
									name: element,
									callback: async (answer: number) => {
										const value = filtered[answer];

										(array as unknown[]).push(value);
										dirty = true;
										return false;
									},
								})),
							],
						);

						return true;
					},
				},
				{
					name: "Delete",
					defaultSound: false,
					callback: async () => {
						game.audio.playSFX("ui.delete");

						array.pop();
						dirty = true;
						return true;
					},
				},
			],
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
		rawObject: any,
		allowAddingAndDeleting = true,
		onLoop?: () => Promise<void>,
	) {
		let dirty = false;

		let object = rawObject;
		if (rawObject instanceof Function) {
			object = await rawObject();
		}

		await game.prompt.createUILoop(
			{
				message: "Configure Object",
				backButtonText: "Done",
				dynamicChoices: true,
				callbackBefore: async () => {
					await onLoop?.();
					console.log(JSON.stringify(object, null, 4));
					console.log();
				},
				callbackAfter: async () => {
					if (rawObject instanceof Function) {
						object = await rawObject();
					}

					await onLoop?.();
					console.log(JSON.stringify(object, null, 4));
					console.log();
				},
			},
			async () => [
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

						game.audio.playSFX("ui.delete");

						delete object[key];
						dirty = true;
						return true;
					},
				},
			],
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
		game.interact.print.watermark();
		console.log();

		const { branch } = game.info.version();

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
			result = Boolean(await game.deckcode.import(player, deckcode));

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

			await game.interact.print.gameState(game.player);
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

		await game.interact.print.gameState(player);

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
		game.event.newHistoryChild(
			Event.TargetSelectionStarts,
			[prompt, card, flags],
			game.player,
		);

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

		game.event.finishHistoryChild();
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
		await game.interact.print.gameState(player, false);

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

			game.data.remove(game.player.deck, card);
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
			game.data.remove(game.player.deck, card);
			game.player.addToDeck(card);

			return card;
		}

		await game.interact.print.gameState(game.player);
		console.log();

		const chosen = await game.prompt.customSelect(
			prompt,
			await game.card.readables(cards),
			{
				arrayTransform: undefined,
				hideBack: true,
			},
		);

		const card = cards[parseInt(chosen, 10)];

		// Removes the selected card from the players deck.
		game.data.remove(game.player.deck, card);
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
				game.card.validateClasses(card.classes, game.player.heroClass),
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
			await game.card.readables(cards),
			{
				arrayTransform: undefined,
				hideBack: true,
			},
		);

		const card = cards[parseInt(choice, 10)];
		return card.perfectCopy();
	},

	/**
	 * Asks the user to attack a minion or hero. Used in the gameloop.
	 * I don't recommend using this function.
	 *
	 * @returns Cancel | Success
	 */
	async gameloopAttack() {
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

			if (!attacker || !target) {
				return -1;
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
				return -1;
			}

			target = await this.target(
				"Which target do you want to attack?",
				undefined,
				{ alignment: Alignment.Enemy },
				async (target: Target) => !target.canBeAttacked(),
			);

			if (!target) {
				return -1;
			}
		}

		const errorCode = await game.attack(attacker, target);

		const ignore = [GameAttackReturn.DivineShield];
		if (errorCode === GameAttackReturn.Success || ignore.includes(errorCode)) {
			return { attacker, target };
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
				error = `An unknown error occurred. Error code: UnexpectedAttackingResult@${errorCode}`;

				break;
			}
		}

		console.log(`<red>${error}.</red>`);
		await game.pause("");
		return new Error(error);
	},
};
