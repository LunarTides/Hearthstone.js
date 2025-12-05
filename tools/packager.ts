// Allows importing / exporting .hspkg files.
import { Card } from "@Game/card.ts";
import { createGame } from "@Game/game.ts";
import { randomUUID } from "node:crypto";
import { confirm, input, Separator, select } from "@inquirer/prompts";
import { semver } from "bun";
import { parseTags } from "chalk-tags";
import * as hub from "hub.ts";
import { validate } from "scripts/id/lib.ts";

const { game } = await createGame();

const metadataVersion = 1;

interface Metadata {
	versions: {
		metadata: number;
		game: string;
		pack: string;
	};
	name: string;
	authors: string[];
	links: Record<string, string>;
	requires: {
		packs: string[];
		cards: string[];
		classes: string[];
		// Add tribes, etc...
	};
}

async function parseMetadataFile(pack: string) {
	if (!(await game.functions.util.fs("exists", `/packs/${pack}/meta.jsonc`))) {
		await game.pause(
			"<red>Invalid pack. This pack doesn't include a 'meta.jsonc' file.</red>\n",
		);
		return false;
	}

	const metadata: Metadata = JSON.parse(
		(await game.functions.util.fs(
			"readFile",
			`/packs/${pack}/meta.jsonc`,
			"utf8",
		)) as string,
	);

	// Metadata version
	if (metadata.versions.metadata !== metadataVersion) {
		const skip = await confirm(
			{
				message: parseTags(
					"<yellow>Incompatible metadata version. Skip metadata parsing?</yellow>",
				),
			},
			{ clearPromptOnDone: true },
		);

		return skip;
	}

	// Game version
	const currentMajorVersion = game.functions.info
		.version()
		.version.split(".")[0];
	const metaMajorVersion = metadata.versions.game.split(".")[0];

	if (currentMajorVersion !== metaMajorVersion) {
		const skip = await confirm(
			{
				message: parseTags(
					"<yellow>Incompatible game version. The pack will likely not work. Skip metadata parsing?</yellow>",
				),
			},
			{ clearPromptOnDone: true },
		);

		return skip;
	}

	// TODO: Parse requires.

	return true;
}

async function importPackage() {
	// FIXME: Importing the same package twice breaks ids.
	while (true) {
		hub.watermark(false);

		const packs: string[] = [];

		await game.functions.util.searchFolder(
			"/packs",
			async (index, path, file) => {
				if (!file.parentPath.endsWith("/packs") || !file.isDirectory()) {
					return;
				}

				packs.push(file.name);
			},
		);

		const choices = [];
		for (const [i, pack] of Object.entries(packs)) {
			choices.push({
				name: pack,
				value: i,
			});
		}
		choices.push(new Separator());
		choices.push({
			name: "Done",
			value: "done",
		});

		const answer = await select(
			{
				message: "Choose a Pack",
				choices,
			},
			{ clearPromptOnDone: true },
		);

		if (answer === "done") {
			break;
		}

		// console.log(packs.map((p, i) => `${i + 1}: ${p}`).join("\n"));

		const index = parseInt(answer, 10);
		// if (Number.isNaN(index) || index <= 0 || index > packs.length) {
		// 	await game.pause("Invalid index.");
		// 	return await importPackage();
		// }

		const pack = packs[index];

		// Read and validate metadata.
		if (!(await parseMetadataFile(pack))) {
			continue;
		}

		await game.functions.util.fs("mkdir", `/cards/Packs/${pack}`, {
			recursive: true,
		});

		// Change ids to align with latest id.
		const latestId = await Card.latestId();

		await game.functions.util.searchCardsFolder(
			async (path, content, file, index) => {
				let newContent = content;
				let fileName = file.name;

				// Only change the id of there isn't an old version of the file already exists (package upgrade).
				if (
					!(await game.functions.util.fs(
						"exists",
						`/cards/Packs/${pack}/${file.name}`,
					))
				) {
					newContent = content.replace(
						/\tid: \d+,/,
						`\tid: ${latestId + index + 1},`,
					);

					// If the file name starts with a number then a dash, replace that number with the new id.
					// This is so that the file name matches the id.
					if (/^\d+-/.test(fileName)) {
						fileName = `${latestId + index + 1}-${file.name.split("-").slice(1).join("-")}`;
					}
				}

				await game.functions.util.fs(
					"writeFile",
					`/cards/Packs/${pack}/${fileName}`,
					newContent,
				);
			},
			`/packs/${pack}`,
		);

		await validate(false, false);

		console.log(
			`<green>The pack has been imported into '/cards/Packs/${pack}'.</green>\n`,
		);

		const deleteConfirm = await confirm({
			message: `Do you want to delete '/packs/${pack}'?`,
		});
		if (deleteConfirm) {
			await game.functions.util.fs("rm", `/packs/${pack}`, {
				recursive: true,
				force: true,
			});
		}
	}
}

async function exportPackage() {
	const uuid = randomUUID();

	const metadata: Metadata = {
		versions: {
			metadata: metadataVersion,
			game: game.functions.info.version().version,
			pack: "1.0.0",
		},
		name: "",
		authors: [],
		links: {},
		requires: {
			packs: [],
			cards: [],
			classes: [],
			// Add tribes, etc...
		},
	};

	await configureMetadata(metadata);

	await game.functions.util.fs("mkdir", `/packs/${uuid}`, { recursive: true });
	await game.functions.util.searchCardsFolder(async (path, content, file) => {
		if (path.includes("/Custom")) {
			await game.functions.util.fs(
				"cp",
				path,
				game.functions.util.restrictPath(`/packs/${uuid}/${file.name}`),
			);
		}
	});

	await game.functions.util.fs(
		"writeFile",
		`/packs/${uuid}/meta.jsonc`,
		JSON.stringify(metadata, null, 4),
	);

	await game.pause(
		`Done.\n\nNext steps:\n1. Check the cards in '/packs/${uuid}'. Add / remove the cards you want in the package.\n2. Compress the 'packs/${uuid}' folder.\n3. Send the compressed file to whoever you'd like.\n`,
	);
}

async function configureMetadataArray(array: string[]) {
	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(array, null, 4));
		console.log();

		const choices = [];
		for (const i in array) {
			choices.push({
				name: `Element ${i}`,
				value: i,
			});
		}
		choices.push(new Separator());
		choices.push({
			name: `New`,
			value: "new",
		});
		choices.push({
			name: `Delete`,
			value: "delete",
		});
		choices.push(new Separator());
		choices.push({
			name: "Done",
			value: "done",
		});

		const answer = await select(
			{
				message: "Configure Array",
				choices,
				loop: false,
			},
			{ clearPromptOnDone: true },
		);

		if (answer === "new") {
			const value = await input({
				message: "Value.",
			});

			array.push(value);
			continue;
		} else if (answer === "delete") {
			array.pop();
			continue;
		} else if (answer === "done") {
			break;
		}

		const index = parseInt(answer, 10);

		const newValue = await input({
			message: "What will you change this value to?",
			default: array[index],
		});

		array[index] = newValue;
	}
}

async function configureMetadataObject(
	object: any,
	allowAddingAndDeleting = true,
) {
	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(object, null, 4));
		console.log();

		const choices = [];
		for (const v of Object.keys(object)) {
			choices.push({
				name: v,
				value: `element-${v}`,
			});
		}
		if (allowAddingAndDeleting) {
			choices.push(new Separator());
			choices.push({
				name: `New`,
				value: "new",
			});
			choices.push({
				name: `Delete`,
				value: "delete",
			});
		}
		choices.push(new Separator());
		choices.push({
			name: "Done",
			value: "done",
		});

		const answer = await select(
			{
				message: "Configure Object",
				choices,
				loop: false,
			},
			{ clearPromptOnDone: true },
		);

		if (allowAddingAndDeleting) {
			if (answer === "new") {
				const key = await input(
					{
						message: "Key.",
					},
					{ clearPromptOnDone: true },
				);
				const value = await input(
					{
						message: "Value.",
					},
					{ clearPromptOnDone: true },
				);

				object[key] = value;
				continue;
			} else if (answer === "delete") {
				const key = await input(
					{
						message: "Key.",
					},
					{ clearPromptOnDone: true },
				);

				delete object[key];
				continue;
			}
		}

		if (answer === "done") {
			break;
		}

		const key = answer.split("-").slice(1).join("-");

		if (Array.isArray(object[key])) {
			await configureMetadataArray(object[key]);
			continue;
		}

		const newValue = await input({
			message: "What will you change this value to?",
			default: object[key],
		});

		object[key] = newValue;
	}
}

async function configureMetadata(metadata: Metadata) {
	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(metadata, null, 4));
		console.log();

		const answer = await select(
			{
				message: "Configure Metadata",
				choices: [
					{
						name: "Version",
						value: "version",
						description: "The version of the pack. Uses semver.",
					},
					{
						name: "Name",
						value: "name",
						description: "The name of the pack. This must be unique.",
					},
					{
						name: "Authors",
						value: "authors",
						description: "The authors of the pack.",
					},
					{
						name: "Links",
						value: "links",
						description:
							"Any links. These links can lead anywhere. Don't link to any dangerous websites.",
					},
					{
						name: "Requires",
						value: "requires",
						description: "Pack dependencies.",
					},
					new Separator(),
					{
						name: "Done",
						value: "done",
						description: "Done configuring metadata.",
					},
				],
			},
			{ clearPromptOnDone: true },
		);

		if (answer === "version") {
			metadata.versions.pack = await input({
				message: "Set the version of the pack.",
				default: metadata.versions.pack,
				validate: (value) => semver.satisfies(value, ">0.0.0"),
			});
		} else if (answer === "name") {
			metadata.name = await input({
				message: "Set the name of the pack. This must be unique.",
				default: metadata.name,
			});
		} else if (answer === "authors") {
			await configureMetadataArray(metadata.authors);
		} else if (answer === "links") {
			await configureMetadataObject(metadata.links);
		} else if (answer === "requires") {
			await configureMetadataObject(metadata.requires, false);
		} else if (answer === "done") {
			const done = await confirm({
				message: "Are you sure you are done configuring the metadata?",
				default: false,
			});

			if (done) {
				break;
			}
		}
	}
}

export async function main() {
	await hub.userInputLoop(
		"<green>(E)xport a package</green>, <blue>(I)mport a package</blue>, <red>(B)ack</red>: ",
		"b",
		async (input) => {
			const command = input[0].toLowerCase();

			if (command === "e") {
				await exportPackage();
			} else if (command === "i") {
				await game.pause(
					"Extract and drag the folder into '/packs/. Press enter when you're done.",
				);

				await importPackage();
			}
		},
	);
}
