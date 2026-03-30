// Allows importing / exporting packs.
// PERF: This tool is *not* performant.
// But even having 80+ packs in the packs folder at once doesn't cause any issues on a relatively bad pc.

import { createGame } from "@Game/game.ts";
import type { Metadata } from "@Game/types/pack.ts";
import fs from "node:fs/promises";
import { resolve } from "node:path";
import { confirm } from "@inquirer/prompts";
import { parseTags } from "chalk-tags";
import { validate } from "tools/id/lib.ts";
import { configureMetadata, main as prompt } from "./prompt.ts";
import { RegBot } from "./regbot.ts";

await createGame();

type Pack = Awaited<ReturnType<typeof getPacks>>[0];
const metadataVersion = 1;

export function getPermissions(metadata: Metadata, filter = true) {
	return Object.entries(metadata.permissions)
		.filter(([_, value]) => !filter || Boolean(value))
		.map(([key]) => key);
}

export async function getPacks() {
	const packs: {
		ownerName: string;
		name: string;
		path: string;
		parentPath: string;
		compressed: boolean;
		bytes: Buffer;
	}[] = [];

	await game.fs.searchFolder(
		"/packs/vacuum",
		async (index, path, file) => {
			if (
				!file.parentPath.endsWith("vacuum") ||
				!(
					(file.isFile() && file.name.endsWith(".tar.gz")) ||
					(file.isDirectory() &&
						(await game.fs.call("exists", resolve(path, "pack.json5"))))
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

	// NOTE: The packs are sorted so that they are in a consistant order.
	return packs.toSorted((a, b) => a.path.localeCompare(b.path));
}

export async function parseMetadataFile(pack: string) {
	if (!(await game.fs.call("exists", `/packs/vacuum/${pack}/pack.json5`))) {
		await game.pause(
			"<red>Invalid pack. This pack doesn't include a 'pack.json5' file.</red>\n",
		);
		return null;
	}

	const metadata: Metadata = Bun.JSON5.parse(
		(await game.fs.call(
			"readFile",
			`/packs/vacuum/${pack}/pack.json5`,
			"utf8",
			{
				invalidateCache: true,
			},
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
	const currentMajorVersion = game.info.version().version.split(".")[0];
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

export async function importPack(
	pack: Pack,
	options: { forceDelete: boolean } = { forceDelete: false },
) {
	const folderPath = `${pack.parentPath}/${pack.ownerName}+${pack.name}`;
	if (pack.compressed) {
		await extractPack(pack.path);
		pack.path = folderPath;
		pack.compressed = false;
	}

	// Read and validate metadata.
	const metadata = await parseMetadataFile(`${pack.ownerName}+${pack.name}`);
	if (!metadata) {
		await compressPack(folderPath);
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
			await compressPack(folderPath);
			return false;
		}
	}

	await game.fs.call(
		"cp",
		pack.path,
		game.fs.restrictPath(`/packs/@${pack.ownerName}/${pack.name}`),
		{ recursive: true },
	);

	await validate(false, false);
	await game.card.generateIdsFile();

	console.log(
		`<green>The pack has been imported into '/packs/@${pack.ownerName}/${pack.name}'.</green>\n`,
	);

	if (options.forceDelete) {
		await game.fs.call("rm", pack.path, {
			recursive: true,
			force: true,
		});
	} else {
		const deleteConfirm = await confirm({
			message: `Do you want to delete '/packs/vacuum/${pack.ownerName}+${pack.name}'?`,
		});
		if (deleteConfirm) {
			await game.fs.call("rm", pack.path, {
				recursive: true,
				force: true,
			});
		} else {
			// Re-compress pack for the future.
			await compressPack(pack.path);
		}
	}

	return true;
}

export async function exportPack(pack?: Pack) {
	let metadata: Metadata;

	const folderPath = pack
		? `${pack.parentPath}/${pack.ownerName}+${pack.name}`
		: "";
	if (pack) {
		const folderPath = `${pack.parentPath}/${pack.ownerName}+${pack.name}`;
		if (pack.compressed) {
			await extractPack(pack.path);
			pack.path = folderPath;
			pack.compressed = false;
		}

		if (!(await game.fs.call("exists", resolve(pack.path, "pack.json5")))) {
			await game.pause(
				"<yellow>That pack doesn't have a 'pack.json5' file.</yellow>",
			);
			await compressPack(folderPath);
			return false;
		}

		metadata = Bun.JSON5.parse(
			(await game.fs.call("readFile", `${pack.path}/pack.json5`, "utf8", {
				invalidateCache: true,
			})) as string,
		) as Metadata;
	} else {
		metadata = {
			versions: {
				metadata: metadataVersion,
				game: game.info.version().version,
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
		if (folderPath) {
			await compressPack(folderPath);
		}

		return false;
	}

	const author = metadata.author || "You";
	const name = metadata.name || (pack?.name ?? Bun.randomUUIDv7());

	await game.fs.call("mkdir", `/packs/vacuum/${author}+${name}`, {
		recursive: true,
	});

	// Copy custom resources over to the pack.
	await game.fs.searchCardsFolder(async (path, content, file) => {
		if (path.includes("Custom")) {
			await game.fs.call(
				"cp",
				path,
				game.fs.restrictPath(`/packs/vacuum/${author}+${name}/${file.name}`),
			);
		}
	});

	// Write metadata file.
	await game.fs.call(
		"writeFile",
		`/packs/vacuum/${author}+${name}/pack.json5`,
		Bun.JSON5.stringify(metadata, null, 4)!,
	);

	console.log(
		`<green>Done.</green>\n\nNext steps:\n1. Check out '/packs/vacuum/${author}+${name}'. Add / remove the files you want in the pack.\n2. Choose 'Compress' then send the file to whoever you want, alternatively, upload to the registry using 'Registry > Upload'.`,
	);
	await game.pause();

	return true;
}

export async function compressPack(path: string) {
	const stats = await game.fs.call("stat", path);
	if (!stats.isDirectory()) {
		return;
	}

	// Add files to archive.
	const files: Record<string, string> = {};

	await game.fs.searchFolder(path, async (index, p, file, content) => {
		if (!content) {
			return;
		}

		const relativePath = p.split(path)[1];
		files[relativePath] = content;
	});

	const archive = new Bun.Archive(files, { compress: "gzip" });
	const bytes = await archive.bytes();
	await game.fs.call("writeFile", `${path}.tar.gz`, bytes);

	await game.fs.call("rm", path, {
		recursive: true,
		force: true,
	});
}

export async function extractPack(path: string) {
	const stats = await game.fs.call("stat", path);
	if (!stats.isFile()) {
		return;
	}

	const bytes = (await fs.readFile(path)) as Buffer<ArrayBuffer>;

	const folderPath = path.replace(".tar.gz", "");

	const archive = new Bun.Archive(bytes);
	await game.fs.call("mkdir", folderPath);
	await archive.extract(folderPath);
	await game.fs.call("rm", path, { recursive: true });
}

const regbot = new RegBot({
	baseUrl: game.config.general.registryUrl,
});

export async function main() {
	await prompt(regbot);
}

if (import.meta.main) {
	await main();
}
