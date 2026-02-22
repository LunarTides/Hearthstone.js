// Allows importing / exporting packs.
// PERF: This tool is *not* performant.
// But even having 80+ packs in the packs folder at once doesn't cause any issues on a relatively bad pc.

import { createGame } from "@Game/game.ts";
import type { Metadata } from "@Game/types/pack";
import fs from "node:fs/promises";
import { resolve } from "node:path";
import { confirm, Separator } from "@inquirer/prompts";
import { semver } from "bun";
import { parseTags } from "chalk-tags";
import * as hub from "hub.ts";
import { validate } from "tools/id/lib";
import { RegBot } from "./regbot";

const { game } = await createGame();

type Pack = Awaited<ReturnType<typeof getPacks>>[0];

const metadataVersion = 1;

// This will be set to true after changing a metadata configuration value.
let dirty = false;

function getPermissions(metadata: Metadata, filter = true) {
	return Object.entries(metadata.permissions)
		.filter(([_, value]) => !filter || Boolean(value))
		.map(([key]) => key);
}

async function getPacks() {
	const packs: {
		ownerName: string;
		name: string;
		path: string;
		parentPath: string;
		compressed: boolean;
		bytes: Buffer;
	}[] = [];

	await game.functions.util.searchFolder(
		"/packs",
		async (index, path, file) => {
			if (
				!file.parentPath.endsWith("packs") ||
				!(
					(file.isFile() && file.name.endsWith(".tar.gz")) ||
					(file.isDirectory() &&
						(await game.functions.util.fs(
							"exists",
							resolve(path, "pack.json5"),
						)))
				)
			) {
				return;
			}

			const [ownerName, name] = (
				file.isDirectory()
					? file.name
					: file.name.split(".").slice(0, -2).join(".")
			)
				// "Username/Pack (2)" -> "@Username/Pack". This is for if you download multiple versions of the same pack.
				.replace(/ \(\d+\)$/, "")
				.split("+");

			let bytes = Buffer.alloc(0);
			if (file.isFile()) {
				bytes = (await fs.readFile(path)) as Buffer<ArrayBuffer>;
			}

			packs.push({
				ownerName,
				name,
				path,
				parentPath: file.parentPath,
				compressed: file.name.endsWith(".tar.gz"),
				bytes,
			});
		},
		false,
	);

	return packs;
}

async function parseMetadataFile(pack: string) {
	if (!(await game.functions.util.fs("exists", `/packs/${pack}/pack.json5`))) {
		await game.pause(
			"<red>Invalid pack. This pack doesn't include a 'pack.json5' file.</red>\n",
		);
		return null;
	}

	const metadata: Metadata = Bun.JSON5.parse(
		(await game.functions.util.fs(
			"readFile",
			`/packs/${pack}/pack.json5`,
			"utf8",
			{ invalidateCache: true },
		)) as string,
	) as Metadata;

	// Metadata version
	if (metadata.versions.metadata !== metadataVersion) {
		const skip = await confirm({
			message: parseTags(
				"<yellow>Incompatible metadata version. Skip metadata parsing?</yellow>",
			),
		});

		if (skip) {
			return null;
		}
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

		if (skip) {
			return null;
		}
	}

	// TODO: Parse requires.

	return metadata;
}

async function importPack(
	pack: Pack,
	options: { forceDelete: boolean } = { forceDelete: false },
) {
	if (pack.compressed) {
		const archive = new Bun.Archive(pack.bytes);
		const folderPath = `${pack.parentPath}/${pack.ownerName}+${pack.name}`;
		await game.functions.util.fs("mkdir", folderPath);
		await archive.extract(folderPath);
		await game.functions.util.fs("rm", pack.path);

		pack.path = folderPath;
		pack.compressed = false;
	}

	// Read and validate metadata.
	const metadata = await parseMetadataFile(`${pack.ownerName}+${pack.name}`);
	if (!metadata) {
		return false;
	}

	if (Object.values(metadata.permissions).some(Boolean)) {
		console.warn(
			`<yellow>This pack requires the following permissions: ${getPermissions(metadata).join(", ")}`,
		);

		const permissionConfirm = await confirm({
			message: parseTags(
				`<yellow>Are you sure you want to import this pack? This will grant the pack access to those resources.</yellow>`,
			),
			default: false,
		});
		if (!permissionConfirm) {
			return false;
		}
	}

	await game.functions.util.fs(
		"cp",
		pack.path,
		game.functions.util.restrictPath(`/cards/@${pack.ownerName}/${pack.name}`),
		{ recursive: true },
	);

	await validate(false, false);
	await game.functions.card.generateIdsFile();

	console.log(
		`<green>The pack has been imported into '/cards/@${pack.ownerName}/${pack.name}'.</green>\n`,
	);

	if (options.forceDelete) {
		await game.functions.util.fs("rm", pack.path, {
			recursive: true,
			force: true,
		});
	} else {
		const deleteConfirm = await confirm({
			message: `Do you want to delete '/packs/${pack.ownerName}+${pack.name}'?`,
		});
		if (deleteConfirm) {
			await game.functions.util.fs("rm", pack.path, {
				recursive: true,
				force: true,
			});
		}
	}

	return true;
}

async function promptImportPack() {
	let packs = await getPacks();

	await hub.createUILoop(
		{
			message: "Import a Pack",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			callbackBefore: async () => {
				hub.watermark(false);

				console.log(
					"Download a pack, then drag the extracted folder into '/packs/'.\n",
				);

				packs = await getPacks();
			},
		},
		...packs.map((p) => ({
			name: `@${p.ownerName}/${p.name}`,
			callback: async (answer) => {
				const pack = packs[answer];
				const success = await importPack(pack);
				if (success) {
					hub.playCool();
				}

				return true;
			},
		})),
		new Separator(),
		{
			name: "Refresh",
		},
	);
}

async function exportPack(pack?: Pack) {
	let metadata: Metadata;

	if (pack) {
		if (pack.compressed) {
			const archive = new Bun.Archive(pack.bytes);
			const folderPath = `${pack.parentPath}/${pack.ownerName}+${pack.name}`;
			await game.functions.util.fs("mkdir", folderPath);
			await archive.extract(folderPath);
			await game.functions.util.fs("rm", pack.path);

			pack.path = folderPath;
			pack.compressed = false;
		}

		if (
			!(await game.functions.util.fs(
				"exists",
				resolve(pack.path, "pack.json5"),
			))
		) {
			await game.pause(
				"<yellow>That pack doesn't have a 'pack.json5' file.</yellow>",
			);
			return false;
		}

		metadata = Bun.JSON5.parse(
			(await game.functions.util.fs(
				"readFile",
				`${pack.path}/pack.json5`,
				"utf8",
				{ invalidateCache: true },
			)) as string,
		) as Metadata;
	} else {
		metadata = {
			versions: {
				metadata: metadataVersion,
				game: game.functions.info.version().version,
				pack: "1.0.0",
			},
			name: "",
			description: "",
			author: "",
			// NOTE: Can't legally license this under an open-source license without express consent from the user.
			// So it defaults to "Proprietary"
			license: "Proprietary",
			links: {},
			permissions: {
				network: false,
				fileSystem: false,
			},
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
		return false;
	}

	const author = metadata.author || "You";
	const name = metadata.name || Bun.randomUUIDv7();

	await game.functions.util.fs("mkdir", `/packs/${author}+${name}`, {
		recursive: true,
	});

	// Copy custom cards over to the pack.
	await game.functions.util.searchCardsFolder(async (path, content, file) => {
		if (path.includes("Custom")) {
			await game.functions.util.fs(
				"cp",
				path,
				game.functions.util.restrictPath(
					`/packs/${author}+${name}/${file.name}`,
				),
			);
		}
	});

	// Write metadata file.
	await game.functions.util.fs(
		"writeFile",
		`/packs/${author}+${name}/pack.json5`,
		Bun.JSON5.stringify(metadata, null, 4)!,
	);

	await game.pause(
		`<green>Done.</green>\n\nNext steps:\n1. Check the cards in '/packs/${author}+${name}'. Add / remove the cards you want in the pack.\n2. Press enter to compress...`,
	);

	// Add files to archive.
	const files: Record<string, string> = {};

	await game.functions.util.searchFolder(
		`/packs/${author}+${name}`,
		async (index, path, file, content) => {
			if (!content) {
				return;
			}

			const relativePath = path.split(`${author}+${name}`)[1];
			files[relativePath] = content;
		},
	);

	const archive = new Bun.Archive(files, { compress: "gzip" });
	const bytes = await archive.bytes();
	await game.functions.util.fs(
		"writeFile",
		`/packs/${author}+${name}.tar.gz`,
		bytes,
	);

	await game.functions.util.fs("rm", `/packs/${author}+${name}`, {
		recursive: true,
		force: true,
	});

	await game.pause(
		`<green>Done.</green> Send the compressed file to whoever you'd like.\n`,
	);

	return true;
}

async function promptExportPack() {
	let packs = await getPacks();

	await hub.createUILoop(
		{
			message: "Export a Pack",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			callbackBefore: async () => {
				hub.watermark(false);
				dirty = false;

				packs = await getPacks();
			},
		},
		...packs.map((p) => ({
			name: `@${p.ownerName}/${p.name}`,
			callback: async (answer) => {
				const pack = packs.at(answer);
				await exportPack(pack);

				return true;
			},
		})),
		{
			name: "New",
			callback: async () => {
				await exportPack();

				return true;
			},
		},
		new Separator(),
		{
			name: "Refresh",
		},
	);
}

async function configureMetadata(metadata: Metadata) {
	await hub.createUILoop(
		{
			message: "Configure Metadata",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			callbackBefore: async () => {
				hub.watermark(false);
				console.log(Bun.JSON5.stringify(metadata, null, 4));
				console.log();
			},
		},
		{
			name: "Version",
			description: "The version of the pack. Uses semver.",
			callback: async () => {
				// TODO: Use `game.input` instead.
				metadata.versions.pack = await game.input({
					message: "Set the version of the pack.",
					default: metadata.versions.pack,
					validate: (value) => semver.satisfies(value, ">0.0.0"),
				});

				dirty = true;
				return true;
			},
		},
		{
			name: "Name",
			description: "The name of the pack. This must be unique for the author.",
			callback: async () => {
				metadata.name = await game.input({
					message: "Set the name of the pack. This must be unique.",
					default: metadata.name,
				});

				dirty = true;
				return true;
			},
		},
		{
			name: "Description",
			description: "The description of the pack.",
			callback: async () => {
				metadata.description = await game.input({
					message: "Set the description of the pack.",
					default: metadata.description,
				});

				dirty = true;
				return true;
			},
		},
		{
			name: "Author",
			description:
				"The author of the pack. Can be a username or a group name. Must be set when uploading to a registry.",
			callback: async () => {
				metadata.author = await game.input({
					message: "Author.",
					default: metadata.author,
				});

				dirty = true;
				return true;
			},
		},
		{
			name: "License",
			description:
				"The license that the pack is under. For example, 'GPL-3.0', 'MIT', 'Apache-2.0', etc...",
			callback: async () => {
				const licenses = [
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
				];

				// TODO: Use `hub.createUILoop`
				const license = await game.prompt.customSelect(
					"Set the license of the pack.",
					[],
					{
						hideBack: true,
						// If the license exists, choose it by default. Otherwise choose "Other".
						default: licenses
							.map((l) => (l instanceof Separator ? undefined : l.value))
							.includes(metadata.license)
							? metadata.license
							: "other",
						arrayTransform: undefined,
					},
					...licenses,
				);

				if (license === "other") {
					metadata.license = await game.input({ message: "License." });
					dirty = true;
					return true;
				}

				metadata.license = license;
				dirty = true;
				return true;
			},
		},
		{
			name: "Links",
			description:
				"Any links. These links can lead anywhere. Don't link to any dangerous websites.",
			callback: async () => {
				const changed = await game.prompt.configureObject(
					metadata.links,
					true,
					async () => hub.watermark(false),
				);

				// NOTE: I can't do `dirty ||= await game.prompt...` since if dirty is true, it won't evaluate the right side of the expression.
				// Learned that the hard way...
				dirty ||= changed;
				return true;
			},
		},
		{
			name: "Permissions",
			description:
				"Resources that the pack needs to function. Check this out before exporting.",
			callback: async () => {
				const changed = await game.prompt.configureObject(
					metadata.permissions,
					false,
					async () => hub.watermark(false),
				);

				dirty ||= changed;
				return true;
			},
		},
		{
			name: "Requires",
			description: "Pack dependencies.",
			callback: async () => {
				// TODO: Capitalize the choices.
				const changed = await game.prompt.configureObject(
					metadata.requires,
					false,
					async () => hub.watermark(false),
				);

				dirty ||= changed;
				return true;
			},
		},
		new Separator(),
		{
			name: "Cancel",
			description: "Cancel changes to the metadata.",
			defaultSound: false,
			callback: async () => {
				if (!dirty) {
					// No changes have been made.
					hub.playBack();
					return false;
				}

				hub.playDelve();

				const done = await confirm({
					message:
						"Are you sure you want to cancel configuring the metadata? Your changes will be lost.",
					default: false,
				});

				if (done) {
					hub.playBack();
					return false;
				}

				return true;
			},
		},
		{
			name: "Done",
			description: "Done configuring the metadata.",
			callback: async () => {
				if (metadata.license === "Proprietary") {
					const licenseConfirm = await confirm({
						message: parseTags(
							"<yellow>You haven't changed the license.\nOthers are not allowed to use this pack without a proper open-source license.\nThink about changing the license to 'GPL-3', 'MIT', 'Apache-2.0', etc...\nContinue anyway?</yellow>",
						),
						default: false,
					});

					if (!licenseConfirm) {
						return true;
					}
				}

				if (!Object.values(metadata.permissions).some(Boolean)) {
					const permissionsConfirm = await confirm({
						message: parseTags(
							`<yellow>You haven't set any permissions. <bold>Are you sure your pack doesn't require any of the following permissions: ${getPermissions(metadata, false).join(", ")}?</bold></yellow>`,
						),
						default: false,
					});

					if (!permissionsConfirm) {
						return true;
					}
				}

				// TODO: Wrap for sfx.
				const done = await confirm({
					message: "Are you sure you are done configuring the metadata?",
					default: false,
				});

				if (done) {
					hub.playBack();
					return false;
				}

				return true;
			},
		},
	);
}

const registry = {
	prompt: async () => {
		// Ensure networking permissions
		if (!game.config.networking.allow.game) {
			console.error(
				"<yellow>Networking access denied. Please enable 'Networking > Allow > Game' to continue. Aborting.</yellow>",
			);
			await game.pause();
			return;
		}

		await hub.createUILoop(
			{
				message: "Registry Options",
			},
			{
				name: "Download",
				callback: async () => {
					await registry.download.prompt();
					return true;
				},
			},
			{
				name: "Upload (WIP)",
				disabled: true,
			},
		);
	},

	download: {
		prompt: async () => {
			await hub.createUILoop(
				{
					message: "Registry Options > Download",
				},
				{
					name: "Pack",
					callback: async () => {
						await registry.download.pack();
						return true;
					},
				},
				{
					name: "Card (WIP)",
					disabled: true,
				},
			);
		},

		pack: async () => {
			hub.watermark(true);
			console.log("<cyan>?</cyan> <b>Registry Options > Download > Pack</b>");

			const regbot = new RegBot({
				baseUrl: game.config.general.registryUrl,
			});

			// Ask for search query
			const query = await game.input({
				message: "Search query:",
			});

			// Search & Display packs
			const packs = await regbot.searchPacks(query);
			for (const pack of packs) {
				console.log(regbot.displayPack(pack));
			}

			console.log();

			// Prompt the user to select a pack to download
			await hub.createUILoop(
				{
					message: "Registry Options > Download > Pack",
				},
				...packs.map((pack) => ({
					name: `@${pack.ownerName}/${pack.name}`,
					description: regbot.displayPack(pack),
					callback: async (answer) => {
						const pack = packs[answer];

						// Download the pack to the 'packs' folder
						// TODO: Add progress bar.
						console.log("Downloading...");
						await regbot.downloadToPath(
							pack,
							game.functions.util.restrictPath("/packs"),
						);

						const packsInFolder = await getPacks();
						const packInFolder = packsInFolder.find(
							(p) => p.ownerName === pack.ownerName && p.name === pack.name,
						);
						if (!packInFolder) {
							throw new Error("Pack not downloaded successfully.");
						}

						// Prompt the user to import a pack
						const success = await importPack(packInFolder, {
							forceDelete: true,
						});
						if (success) {
							hub.playCool();
							console.log(
								"<green>Pack downloaded & imported successfully!</green>",
							);
							await game.pause();
						}

						return false;
					},
				})),
			);
		},
	},
};

export async function main() {
	await hub.createUILoop(
		{
			message: "Pack Options",
			backButtonText: import.meta.main ? "Exit" : "Back",
		},
		{
			name: "Export a Pack",
			callback: async () => {
				await promptExportPack();
				return true;
			},
		},
		{
			name: "Import a Pack",
			callback: async () => {
				await promptImportPack();
				return true;
			},
		},
		new Separator(),
		{
			name: "Registry",
			callback: async () => {
				await registry.prompt();
				return true;
			},
		},
	);
}

if (import.meta.main) {
	await main();
}
