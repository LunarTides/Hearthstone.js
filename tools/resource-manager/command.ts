// TODO: De-duplicate this file and `sfx.ts`.
import type { Command } from "@Game/types.ts";
import { confirm, Separator } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import { create } from "universe/emergence/create/lib.ts";
import * as hub from "../../hub.ts";

async function configure() {
	const command: Command = {
		name: "change me",
		description: "",
		debug: false,

		run: async () => {
			return false;
		},
	};

	const blacklist: (keyof Command)[] = ["run"];

	const set = (key: keyof typeof command, value: any) => {
		(command as any)[key] = value;
		dirty = true;
	};

	let dirty = false;

	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(command, null, 4));
		console.log();

		// TODO: Extract this functionality.
		const answer = await game.prompt.customSelect(
			"Configure Command",
			Object.keys(command).filter(
				(key) => !blacklist.includes(key as keyof Command),
			),
			{
				arrayTransform: async (i, element) => ({
					name: game.lodash.startCase(element),
					value: `element-${element}`,
				}),
				hideBack: true,
			},
			new Separator(),
			"Cancel",
			"Done",
		);

		if (answer === "cancel") {
			if (!dirty) {
				// No changes have been made.
				return undefined;
			}

			const done = await confirm({
				message:
					"Are you sure you want to cancel creating this command? Your changes will be lost.",
				default: false,
			});

			if (done) {
				return undefined;
			}
		} else if (answer === "done") {
			let message = "Are you sure you are done configuring the command?";

			if (!command.name || command.name === "change me") {
				message = parseTags(
					"<yellow>You haven't changed the name. Continue anyway?</yellow>",
				);
			}

			const done = await confirm({
				message,
				default: false,
			});

			if (done) {
				break;
			}

			continue;
		}

		const key = answer.split("-").slice(1).join("-") as keyof Command;
		const message = game.lodash.startCase(key);

		const value = command[key];

		if (typeof value === "boolean") {
			const booleanChoice = await game.prompt.customSelect(
				message,
				["True", "False"],
				{
					arrayTransform: async (i, element) => ({
						name: element,
						value: element.toLowerCase(),
					}),
					hideBack: false,
				},
			);

			if (booleanChoice === "Back") {
				continue;
			}

			set(key, booleanChoice === "true");
			continue;
		}

		const newValue = await game.input({
			message: "What will you change this value to?",
			default: value?.toString(),
			validate: (value) => {
				// If the key is a number, make sure the new value is one too.
				if (typeof command[key] === "number") {
					const parsed = parseInt(value, 10);
					if (Number.isNaN(parsed)) {
						return "Please enter a valid number";
					}
				}

				return true;
			},
		});

		if (typeof value === "string") {
			set(key, newValue);
		} else {
			set(key, JSON.parse(newValue));
		}
	}

	return command;
}

/**
 * Asks the user a series of questions, and creates a custom command using it.
 * This is not meant to be a library. Running this function will temporarily give control to this function.
 *
 * @returns The path to the file
 */
export async function main({
	// TODO: Remove
	debug = false,
}: {
	debug?: boolean;
}): Promise<string | false> {
	const command = await configure();
	if (!command) {
		return false;
	}

	// Actually create the command.
	console.log("Creating file...");
	const result = await create("command", command);
	game.os.runCommand(`${game.config.general.editor} "${result.path}"`);

	await game.pause();
	return result.path;
}

if (import.meta.main) {
	await main({});
}
