// TODO: De-duplicate this file and `command.ts`.
import type { SFX } from "@Game/types.ts";
import { confirm, Separator } from "@inquirer/prompts";
import { parseTags, resumeTagParsing, stopTagParsing } from "chalk-tags";
import * as hub from "../../hub.ts";

// If this is set to true, this will force debug mode.
const mainDebugSwitch = false;

/**
 * Generates a path for a sfx based on its classes and type.
 *
 * @returns The generated sfx path
 */
function generatePath(): string {
	// Create a path to put the sfx in.

	// DO NOT CHANGE THIS
	const staticPath = `${game.fs.dirname()}/cards/Custom`;

	/*
	 * This can be anything since the game ignores subfolders.
	 * This path can be overridden by passing `overridePath` in the create function.
	 */
	const dynamicPath = `/SFX/`;

	return staticPath + dynamicPath;
}

/**
 * Generates a new sfx based on the provided arguments and saves it to a file.
 *
 * @param sfx The sfx to save.
 * @param overridePath The override path for the sfx.
 * @param overrideFilename The override filename for the sfx.
 * @param debug If true, doesn't save the sfx, just prints out details about it.
 *
 * @returns The path of the created file.
 */
export async function create(
	sfx: SFX,
	overridePath?: string,
	overrideFilename?: string,
	debug?: boolean,
): Promise<string> {
	sfx = game.lodash.clone(sfx);

	const debugMode = debug || mainDebugSwitch;

	// Imports
	const imports = {
		"@Game/modules/audio/audio.ts": "{ octaves }",
		"@Game/types.ts": "{ SFX }",
	};

	// Add play ability
	const abilitiesTexts = [
		`async play(info, options) {
		// Play a sine wave at A4 for 1000ms, with 0 delay after the wave, at 0.3 volume.
		game.audio.playWave("sine", octaves[4].A, 1000, 0.3, 0, 0, options);
  },`,
	];

	// Create a path to put the sfx in.
	let path = generatePath().replaceAll("\\", "/");

	// If this function was passed in a path, use that instead.
	if (overridePath) {
		path = game.fs.dirname() + overridePath;
	}

	// Create a filename. Example: "Test Sound" -> "test-sound.sfx.ts"
	let filename = `${sfx.name.toLowerCase().replaceAll(" ", "-")}.sfx.ts`;

	// If this function was passed in a filename, use that instead.
	if (overrideFilename) {
		filename = overrideFilename;
	}

	const filePath = path + filename;

	// Add the content
	const content = `// Created by the Resource Manager

${Object.entries(imports)
	.map(([key, value]) => `import ${value} from "${key}";`)
	.join("\n")}

export const sfx: SFX = {
\tname: "${sfx.name}",

\t${abilitiesTexts.join("\n\n\t")}
};
`;

	if (debugMode) {
		/*
		 * If debug mode is enabled, just show some information about the sfx.
		 */
		console.log();

		if (mainDebugSwitch) {
			console.warn("<yellow>Main Debug Switch is enabled.</yellow>");
		}

		stopTagParsing();

		console.log(`Would be path: ${filePath.replaceAll("\\", "/")}`);
		console.log("Content:");
		console.log(content);

		resumeTagParsing();
		await game.pause();
	} else {
		// If debug mode is disabled, write the sfx to disk.
		if (!(await game.fs.call("exists", path))) {
			await game.fs.call("mkdir", path, { recursive: true });
		}

		// Write the file to the path
		await game.fs.call("writeFile", filePath, content);

		console.log(`File created at: "${filePath}"`);
	}

	// Open the defined editor on that sfx.
	if (!debugMode) {
		game.os.runCommand(`${game.config.general.editor} "${filePath}"`);
	}

	return filePath;
}

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
	const filePath = await create(sfx, undefined, undefined, debug);

	await game.pause();
	return filePath;
}

if (import.meta.main) {
	await main({});
}
