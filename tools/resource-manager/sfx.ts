// TODO: De-duplicate this file and `command.ts`.
import type { SFX } from "@Game/types.ts";
import { confirm, Separator } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import { create, postCreate } from "universe/emergence/create/lib.ts";
import * as hub from "../../hub.ts";

async function configure() {
	const sfx: SFX = {
		name: "change me",

		play: async () => {},
	};

	const blacklist: (keyof SFX)[] = ["play"];

	const set = (key: keyof typeof sfx, value: any) => {
		(sfx as any)[key] = value;
		dirty = true;
	};

	let dirty = false;

	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(sfx, null, 4));
		console.log();

		// TODO: Extract this functionality.
		const answer = await game.prompt.customSelect(
			"Configure SFX",
			Object.keys(sfx).filter((key) => !blacklist.includes(key as keyof SFX)),
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
					"Are you sure you want to cancel creating this sfx? Your changes will be lost.",
				default: false,
			});

			if (done) {
				return undefined;
			}
		} else if (answer === "done") {
			let message = "Are you sure you are done configuring the sfx?";

			if (!sfx.name || sfx.name === "change me") {
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

		const key = answer.split("-").slice(1).join("-") as keyof SFX;
		const value = sfx[key];

		const newValue = await game.input({
			message: "What will you change this value to?",
			default: value?.toString(),
			validate: (value) => {
				// If the key is a number, make sure the new value is one too.
				if (typeof sfx[key] === "number") {
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

	return sfx;
}

/**
 * Asks the user a series of questions, and creates a custom sfx using it.
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
	const sfx = await configure();
	if (!sfx) {
		return false;
	}

	// Actually create the sfx.
	console.log("Creating file...");
	const result = await create("sfx", sfx);
	await postCreate("sfx", sfx);

	game.os.runCommand(`${game.config.general.editor} "${result.path}"`);

	await game.pause();
	return result.path;
}

if (import.meta.main) {
	await main({});
}
