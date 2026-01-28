// Allows importing / exporting packs.
// PERF: This tool is *not* performant.
// But even having 80+ packs in the packs folder at once doesn't cause any issues on a relatively bad pc.

import { createGame } from "@Game/game.ts";
import fs from "node:fs/promises";
import { resolve } from "node:path";
import { confirm, input, Separator } from "@inquirer/prompts";
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
	author: string;
	license: string;
	links: Record<string, string>;
	permissions: {
		network: boolean;
		fileSystem: boolean;
	};
	requires: {
		packs: string[];
		cards: string[];
		classes: string[];
		// TODO: Add tribes, etc...
	};
}

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
							resolve(path, "meta.jsonc"),
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
	if (!(await game.functions.util.fs("exists", `/packs/${pack}/meta.jsonc`))) {
		await game.pause(
			"<red>Invalid pack. This pack doesn't include a 'meta.jsonc' file.</red>\n",
		);
		return null;
	}

	const metadata: Metadata = JSON.parse(
		(await game.functions.util.fs(
			"readFile",
			`/packs/${pack}/meta.jsonc`,
			"utf8",
			{ invalidateCache: true },
		)) as string,
	);

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

async function importPack() {
	while (true) {
		hub.watermark(false);

		console.log(
			"Download a pack, then drag the extracted folder into '/packs/'.\n",
		);

		const packs = await getPacks();
		const answer = await game.prompt.customSelect(
			"Import a Pack",
			packs.map((p) => `@${p.ownerName}/${p.name}`),
			{
				arrayTransform: undefined,
				hideBack: true,
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
			continue;
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
				continue;
			}
		}

		await game.functions.util.fs(
			"cp",
			pack.path,
			game.functions.util.restrictPath(
				`/cards/Packs/@${pack.ownerName}/${pack.name}`,
			),
			{ recursive: true },
		);

		await validate(false, false);
		await game.functions.card.generateIdsFile();

		console.log(
			`<green>The pack has been imported into '/cards/Packs/@${pack.ownerName}/${pack.name}'.</green>\n`,
		);

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
}

async function exportPack() {
	while (true) {
		hub.watermark(false);
		dirty = false;

		const packs = await getPacks();
		const answer = await game.prompt.customSelect(
			"Export a Pack",
			packs.map((p) => `@${p.ownerName}/${p.name}`),
			{ arrayTransform: undefined, hideBack: true },
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
		let metadata: Metadata;

		if (!Number.isNaN(index)) {
			const pack = packs[index];

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
					resolve(pack.path, "meta.jsonc"),
				))
			) {
				await game.pause(
					"<yellow>That pack doesn't have a 'meta.jsonc' file.</yellow>",
				);
				continue;
			}

			metadata = Bun.JSONC.parse(
				(await game.functions.util.fs(
					"readFile",
					`${pack.path}/meta.jsonc`,
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
			continue;
		}

		const author = metadata.author || "You";
		const name = metadata.name || Bun.randomUUIDv7();

		await game.functions.util.fs("mkdir", `/packs/${author}+${name}`, {
			recursive: true,
		});
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

		await game.functions.util.fs(
			"writeFile",
			`/packs/${author}+${name}/meta.jsonc`,
			JSON.stringify(metadata, null, 4),
		);

		await game.pause(
			`<green>Done.</green>\n\nNext steps:\n1. Check the cards in '/packs/${author}+${name}'. Add / remove the cards you want in the pack.\n2. Press enter to compress...`,
		);

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
	}
}

async function configureMetadata(metadata: Metadata) {
	while (true) {
		hub.watermark(false);
		console.log(JSON.stringify(metadata, null, 4));
		console.log();

		const answer = await game.prompt.customSelect(
			"Configure Metadata",
			[],
			{
				hideBack: true,
				arrayTransform: undefined,
			},
			{
				name: "Version",
				value: "version",
				description: "The version of the pack. Uses semver.",
			},
			{
				name: "Name",
				value: "name",
				description:
					"The name of the pack. This must be unique for the author.",
			},
			{
				name: "Description",
				value: "description",
				description: "The description of the pack.",
			},
			{
				name: "Author",
				value: "author",
				description:
					"The author of the pack. Can be a username or a group name. Must be set when uploading to a registry.",
			},
			{
				name: "License",
				value: "license",
				description:
					"The license that the pack is under. For example, 'GPL-3.0', 'MIT', 'Apache-2.0', etc...",
			},
			{
				name: "Links",
				value: "links",
				description:
					"Any links. These links can lead anywhere. Don't link to any dangerous websites.",
			},
			{
				name: "Permissions",
				value: "permissions",
				description:
					"Resources that the pack needs to function. Check this out before exporting.",
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
		);

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
		} else if (answer === "author") {
			metadata.author = await input({
				message: "Author.",
				default: metadata.author,
			});

			dirty = true;
		} else if (answer === "license") {
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
				metadata.license = await input({ message: "License." });
				dirty = true;
				continue;
			}

			metadata.license = license;
			dirty = true;
		} else if (answer === "links") {
			const changed = await game.prompt.configureObject(
				metadata.links,
				true,
				async () => hub.watermark(false),
			);

			// NOTE: I can't do `dirty ||= await game.prompt...` since if dirty is true, it won't evaluate the right side of the expression.
			// Learned that the hard way...
			dirty ||= changed;
		} else if (answer === "permissions") {
			const changed = await game.prompt.configureObject(
				metadata.permissions,
				false,
				async () => hub.watermark(false),
			);

			dirty ||= changed;
		} else if (answer === "requires") {
			// TODO: Capitalize the choices.
			const changed = await game.prompt.configureObject(
				metadata.requires,
				false,
				async () => hub.watermark(false),
			);

			dirty ||= changed;
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
			if (metadata.license === "Proprietary") {
				const licenseConfirm = await confirm({
					message: parseTags(
						"<yellow>You haven't changed the license.\nOthers are not allowed to use this pack without a proper open-source license.\nThink about changing the license to 'GPL-3', 'MIT', 'Apache-2.0', etc...\nContinue anyway?</yellow>",
					),
					default: false,
				});

				if (!licenseConfirm) {
					continue;
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
					continue;
				}
			}

			const done = await confirm({
				message: "Are you sure you are done configuring the metadata?",
				default: false,
			});

			if (done) {
				return true;
			}
		}
	}
}

export async function main() {
	while (true) {
		hub.watermark();

		const answer = await game.prompt.customSelect(
			"Packager Options",
			[],
			{
				arrayTransform: undefined,
				hideBack: true,
			},
			{
				name: "Export a Pack",
				value: "export",
			},
			{
				name: "Import a Pack",
				value: "import",
			},
			new Separator(),
			{
				name: "Back",
				value: "back",
			},
		);

		if (answer === "export") {
			await exportPack();
		} else if (answer === "import") {
			await importPack();
		} else if (answer === "back") {
			break;
		}
	}
}
