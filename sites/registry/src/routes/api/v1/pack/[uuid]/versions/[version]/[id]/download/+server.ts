import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import { resolve } from "path";
import { searchFolder } from "$lib/server/helper";

export async function POST(event) {
	const uuid = event.params.uuid;
	const packVersion = event.params.version;
	const id = event.params.id;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.uuid, uuid),
					eq(table.pack.packVersion, packVersion),
					eq(table.pack.id, id),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	// TODO: Only do this if this IP hasn't already downloaded this? To prevent download inflation by the authors.
	await db
		.update(table.pack)
		.set({ downloadCount: pack.downloadCount + 1 })
		.where(eq(table.pack.id, pack.id));

	const folder = `./static/assets/packs/${pack.uuid}/${pack.packVersion}/${pack.id}`;
	const filename = resolve(folder, `${pack.uuid}.tar.gz`);

	// Compress the folder.
	const files: Record<string, string> = {};

	await searchFolder(
		folder,
		async (index, path, file, content) => {
			if (!content) {
				return;
			}

			const relativePath = path.split(id)[1];
			files[relativePath] = content;
		},
		true,
		false,
	);

	const archive = new Bun.Archive(files, { compress: "gzip" });
	const bytes = await archive.bytes();
	await fs.writeFile(resolve(folder, `${pack.uuid}.tar.gz`), bytes);

	// Get the compressed file.
	const file = await fs.readFile(filename);
	await fs.unlink(filename);

	return new Response(file, {
		headers: {
			"Content-Type": "application/gzip",
			// TODO: The filename should be something like "uuid+id.tar.gz"
			"Content-Disposition": `attachment; filename="${pack.uuid}.tar.gz"`,
		},
	});
}
