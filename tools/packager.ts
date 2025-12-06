// Allows importing / exporting .hspkg files.
// PERF: This tool is *not* performant.
// But even having 80+ packs in the packs folder at once doesn't cause any issues on a relatively bad pc.

import { createGame } from "@Game/game.ts";
import { randomUUID } from "node:crypto";
import { confirm, input, Separator, select } from "@inquirer/prompts";
import { semver } from "bun";
import { parseTags } from "chalk-tags";
import * as hub from "hub.ts";
import { validate } from "scripts/id/lib.ts";

const { game } = await createGame();

const metadataVersion = 1;

// This will be set to true after changing a metadata configuration value.
let dirty = false;

interface Metadata {
	versions: {
		metadata: number;
		game: string;
		pack: string;
	};
	name: string;
	description: string;
	license: string;
	authors: string[];
	links: Record<string, string>;
	requires: {
		packs: string[];
		cards: string[];
		classes: string[];
		// TODO: Add tribes, etc...
	};
}

async function getPacks() {
	const packs: string[] = [];

	await game.functions.util.searchFolder(
		"/packs",
		async (index, path, file) => {
			if (
				!file.parentPath.endsWith("/packs") ||
				!file.isDirectory() ||
				!(await game.functions.util.fs("exists", `${path}/meta.jsonc`))
			) {
				return;
			}

			packs.push(file.name);
		},
	);

	return packs;
}

async function customSelect(
	message: string,
	array: string[],
	arrayTransform:
		| ((
				i: number,
				element: string,
		  ) => Promise<{ name: string; value: string; disabled?: boolean }>)
		| undefined,
	...otherChoices: (Separator | string | false)[]
) {
	const choices = [];
	for (const [i, element] of Object.entries(array)) {
		choices.push(
			(await arrayTransform?.(parseInt(i, 10), element)) ?? {
				name: element,
				value: i,
			},
		);
	}

	for (const element of otherChoices) {
		// Allow doing stuff like `allowAddAndDelete && "Add"` in choices.
		if (element === false) {
			continue;
		}

		if (element instanceof Separator) {
			choices.push(element);
			continue;
		}

		choices.push({
			name: element,
			value: element.toLowerCase(),
		});
	}

	const answer = await select({
		message,
		choices,
		loop: false,
		pageSize: 12,
	});

	return answer;
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
		const skip = await confirm({
			message: parseTags(
				"<yellow>Incompatible metadata version. Skip metadata parsing?</yellow>",
			),
		});

		return skip;
	}

	// Game version
	const currentMajorVersion = game.functions.info
		.version()
		.version.split(".")[0];
	const metaMajorVersion = metadata.versions.game.split(".")[0];

	if (currentMajorVersion !== metaMajorVersion) {
		const skip = await confirm({
			message: parseTags(
				"<yellow>Incompatible game version. The pack will likely not work. Skip metadata parsing?</yellow>",
			),
		});

		return skip;
	}

	// TODO: Parse requires.

	return true;
}

async function importPack() {
	while (true) {
		hub.watermark(false);

		console.log(
			"Download a pack, then drag the extracted folder into '/packs/'.\n",
		);

		const packs = await getPacks();

		// Check if the pack already exists. If it does, show "Update ${oldVersion} -> ${newVersion}"
		const importedPacks: { name: string; version: string }[] = [];
		if (await game.functions.util.fs("exists", "cards/Packs")) {
			await game.functions.util.searchFolder(
				"/cards/Packs",
				async (index, path, file) => {
					if (
						!file.isDirectory() ||
						!(await game.functions.util.fs("exists", `${path}/meta.jsonc`))
					) {
						return;
					}

					// Get the version.
					const metadata: Metadata = JSON.parse(
						(await game.functions.util.fs(
							"readFile",
							`${path}/meta.jsonc`,
							"utf8",
						)) as string,
					);

					importedPacks.push({
						name: file.name,
						version: metadata.versions.pack,
					});
				},
			);
		}

		const answer = await customSelect(
			"Choose a Pack",
			packs,
			async (i, pack) => {
				const o = importedPacks.find((o) => o.name === pack);

				// Get the new version.
				const metadata: Metadata = JSON.parse(
					(await game.functions.util.fs(
						"readFile",
						`/packs/${pack}/meta.jsonc`,
						"utf8",
					)) as string,
				);

				let updateText = "";
				let disabled = false;

				if (o) {
					if (o.version === metadata.versions.pack) {
						updateText = ` (Already imported)`;
						disabled = true;
					} else {
						updateText = ` (Update ${o.version} -> ${metadata.versions.pack})`;
					}
				}

				return {
					name: `${pack}${updateText}`,
					value: i.toString(),
					disabled,
				};
			},
			new Separator(),
			"Refresh",
			"Done",
		);

		if (answer === "refresh") {
			continue;
		}
		if (answer === "done") {
			break;
		}

		const index = parseInt(answer, 10);
		const pack = packs[index];

		// Read and validate metadata.
		if (!(await parseMetadataFile(pack))) {
			continue;
		}

		await game.functions.util.fs(
			"cp",
			`/packs/${pack}`,
			game.functions.util.restrictPath(`/cards/Packs/${pack}`),
			{ recursive: true },
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

async function exportPack() {
	while (true) {
		hub.watermark(false);
		dirty = false;

		const packs = await getPacks();
		const answer = await customSelect(
			"Choose a Pack",
			packs,
			undefined,
			"New",
			new Separator(),
			"Refresh",
			"Done",
		);

		if (answer === "refresh") {
			continue;
		}
		if (answer === "done") {
			break;
		}

		const index = parseInt(answer, 10);

		let uuid: string;
		let metadata: Metadata;

		if (!Number.isNaN(index)) {
			const pack = packs[index];

			if (
				!(await game.functions.util.fs("exists", `/packs/${pack}/meta.jsonc`))
			) {
				game.input(
					"<yellow>That pack doesn't have a 'meta.jsonc' file.</yellow>",
				);
				continue;
			}

			uuid = pack;
			metadata = JSON.parse(
				(await game.functions.util.fs(
					"readFile",
					`/packs/${pack}/meta.jsonc`,
					"utf8",
				)) as string,
			);
		} else {
			uuid = randomUUID();

			metadata = {
				versions: {
					metadata: metadataVersion,
					game: game.functions.info.version().version,
					pack: "1.0.0",
				},
				name: "",
				description: "",
				// NOTE: Can't legally license this under an open-source license without express consent from the user.
				// So it defaults to "Proprietary"
				license: "Proprietary",
				authors: [],
				links: {},
				requires: {
					packs: [],
					cards: [],
					classes: [],
					// Add tribes, etc...
				},
			};
		}

		// If the configuration was cancelled, don't export the pack.
		if (!(await configureMetadata(metadata))) {
			continue;
		}

		await game.functions.util.fs("mkdir", `/packs/${uuid}`, {
			recursive: true,
		});
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
			`Done.\n\nNext steps:\n1. Check the cards in '/packs/${uuid}'. Add / remove the cards you want in the pack.\n2. Compress the 'packs/${uuid}' folder.\n3. Send the compressed file to whoever you'd like.\n`,
		);
	}
}

async function configureMetadataArray(array: string[]) {
	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(array, null, 4));
		console.log();

		const answer = await customSelect(
			"Configure Array",
			array,
			async (i, element) => ({ name: `Element ${i}`, value: i.toString() }),
			new Separator(),
			"New",
			"Delete",
			new Separator(),
			"Done",
		);

		if (answer === "new") {
			const value = await input({
				message: "Value.",
			});

			array.push(value);
			dirty = true;
			continue;
		} else if (answer === "delete") {
			array.pop();
			dirty = true;
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
		dirty = true;
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

		const answer = await customSelect(
			"Configure Object",
			Object.keys(object),
			async (i, element) => ({ name: element, value: `element-${element}` }),
			allowAddingAndDeleting && new Separator(),
			allowAddingAndDeleting && "New",
			allowAddingAndDeleting && "Delete",
			new Separator(),
			"Done",
		);

		if (allowAddingAndDeleting) {
			if (answer === "new") {
				const key = await input({
					message: "Key.",
				});
				const value = await input({
					message: "Value.",
				});

				object[key] = value;
				dirty = true;
				continue;
			} else if (answer === "delete") {
				const key = await input({
					message: "Key.",
				});

				delete object[key];
				dirty = true;
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
		dirty = true;
	}
}

async function configureMetadata(metadata: Metadata) {
	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(metadata, null, 4));
		console.log();

		const answer = await select({
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
					name: "Description",
					value: "description",
					description: "The description of the pack.",
				},
				{
					name: "License",
					value: "license",
					description:
						"The license that the pack is under. For example, 'GPL-3.0', 'MIT', 'Apache-2.0', etc...",
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
					name: "Cancel",
					value: "cancel",
					description: "Cancel changes to the metadata.",
				},
				{
					name: "Done",
					value: "done",
					description: "Done configuring metadata.",
				},
			],
			loop: false,
			pageSize: 12,
		});

		if (answer === "version") {
			metadata.versions.pack = await input({
				message: "Set the version of the pack.",
				default: metadata.versions.pack,
				validate: (value) => semver.satisfies(value, ">0.0.0"),
			});

			dirty = true;
		} else if (answer === "name") {
			metadata.name = await input({
				message: "Set the name of the pack. This must be unique.",
				default: metadata.name,
			});

			dirty = true;
		} else if (answer === "description") {
			metadata.description = await input({
				message: "Set the description of the pack.",
				default: metadata.description,
			});

			dirty = true;
		} else if (answer === "license") {
			const license = await select({
				message: "Set the license of the pack.",
				choices: [
					{
						value: "Proprietary",
						description:
							"Complete copyright. Others can't use this pack. You cannot upload this pack to the registry.",
					},
					new Separator(),
					{
						value: "GPL-2.0",
						description: "GNU General Public License Version 2.0",
					},
					{
						value: "GPL-3.0",
						description: "GNU General Public License Version 3.0",
					},
					{
						value: "AGPL-3.0",
						description: "GNU Affero General Public License Version 3.0",
					},
					{
						value: "MIT",
						description: "MIT License",
					},
					{
						value: "Apache-2.0",
						description: "Apache License Version 2.0",
					},
					new Separator(),
					{
						name: "Other",
						value: "other",
						description: "Specify another license.",
					},
				],
				default: metadata.license,
				loop: false,
				pageSize: 12,
			});

			if (license === "other") {
				metadata.license = await input({ message: "License." });
				dirty = true;
				continue;
			}

			metadata.license = license;
			dirty = true;
		} else if (answer === "authors") {
			await configureMetadataArray(metadata.authors);
		} else if (answer === "links") {
			await configureMetadataObject(metadata.links);
		} else if (answer === "requires") {
			await configureMetadataObject(metadata.requires, false);
		} else if (answer === "cancel") {
			if (!dirty) {
				// No changes have been made.
				return false;
			}

			const done = await confirm({
				message:
					"Are you sure you want to cancel configuring the metadata? Your changes will be lost.",
				default: false,
			});

			if (done) {
				return false;
			}
		} else if (answer === "done") {
			let message = "Are you sure you are done configuring the metadata?";

			if (metadata.license === "Proprietary") {
				message = parseTags(
					"<yellow>You haven't changed the license.\nOthers are not allowed to use this pack without a proper open-source license.\nThink about changing the license to 'GPL-3', 'MIT', 'Apache-2.0', etc...\nContinue anyway?<yellow>",
				);
			}

			const done = await confirm({
				message,
				default: false,
			});

			if (done) {
				return true;
			}
		}
	}
}

export async function main() {
	await hub.userInputLoop(
		"<green>(E)xport a pack</green>, <blue>(I)mport a pack</blue>, <red>(B)ack</red>: ",
		"b",
		async (input) => {
			const command = input[0].toLowerCase();

			if (command === "e") {
				await exportPack();
			} else if (command === "i") {
				await importPack();
			}
		},
	);
}
