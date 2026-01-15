import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import seven from "7zip-min";
import { resolve } from "path";

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
	const filename = resolve(folder, `${pack.uuid}.7z`);

	// TODO: Is this safe?
	await seven.pack(folder, resolve(folder, `${pack.uuid}.7z`));

	const file = await fs.readFile(filename);
	await fs.unlink(filename);

	return new Response(file, {
		headers: {
			"Content-Type": "application/x-7z-compressed",
			// TODO: The filename should be something like "uuid+id.7z"
			"Content-Disposition": `attachment; filename="${pack.uuid}.7z"`,
		},
	});
}
