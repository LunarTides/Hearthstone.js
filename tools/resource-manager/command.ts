// TODO: De-duplicate this file and `sfx.ts`.
import type { Command } from "@Game/types.ts";
import { confirm, Separator } from "@inquirer/prompts";
import { parseTags, resumeTagParsing, stopTagParsing } from "chalk-tags";
import * as hub from "../../hub.ts";

// If this is set to true, this will force debug mode.
const mainDebugSwitch = false;

/**
 * Generates a path for a command based on its classes and type.
 *
 * @returns The generated command path
 */
function generatePath(): string {
	// Create a path to put the command in.

	// DO NOT CHANGE THIS
	const staticPath = `${game.fs.dirname()}/cards/Custom`;

	/*
	 * This can be anything since the game ignores subfolders.
	 * This path can be overridden by passing `overridePath` in the create function.
	 */
	const dynamicPath = `/Commands/`;

	return staticPath + dynamicPath;
}

/**
 * Generates a new command based on the provided arguments and saves it to a file.
 *
 * @param command The command to save.
 * @param overridePath The override path for the command.
 * @param overrideFilename The override filename for the command.
 * @param debug If true, doesn't save the command, just prints out details about it.
 *
 * @returns The path of the created file.
 */
export async function create(
	command: Command,
	overridePath?: string,
	overrideFilename?: string,
	debug?: boolean,
): Promise<string> {
	command = game.lodash.clone(command);

	const debugMode = debug || mainDebugSwitch;

	const cleanedDescription = game.color.stripTags(command.description);

	// Imports
	const imports = { "@Game/types.ts": "{ Command }" };

	// Add run ability
	const abilitiesTexts = [
		`async run(args, useTUI) {
    // ${cleanedDescription}
    return true;
  },`,
	];

	// Create a path to put the command in.
	let path = generatePath().replaceAll("\\", "/");

	// If this function was passed in a path, use that instead.
	if (overridePath) {
		path = game.fs.dirname() + overridePath;
	}

	// Create a filename. Example: "Test Command" -> "test-command.command.ts"
	let filename = `${command.name.toLowerCase().replaceAll(" ", "-")}.command.ts`;

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

export const command: Command = {
\tname: "${command.name}",
\tdescription: "${command.description}",
\tdebug: ${command.debug},

\t${abilitiesTexts.join("\n\n\t")}
};
`;

	if (debugMode) {
		/*
		 * If debug mode is enabled, just show some information about the command.
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
		// If debug mode is disabled, write the command to disk.
		if (!(await game.fs.call("exists", path))) {
			await game.fs.call("mkdir", path, { recursive: true });
		}

		// Write the file to the path
		await game.fs.call("writeFile", filePath, content);

		console.log(`File created at: "${filePath}"`);
	}

	// Open the defined editor on that command.
	if (!debugMode) {
		game.os.runCommand(`${game.config.general.editor} "${filePath}"`);
	}

	return filePath;
}

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
	const filePath = await create(command, undefined, undefined, debug);

	await game.pause();
	return filePath;
}

if (import.meta.main) {
	await main({});
}
