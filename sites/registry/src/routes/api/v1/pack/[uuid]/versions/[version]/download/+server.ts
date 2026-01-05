import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import seven from "7zip-min";
import { resolve } from "path";

export async function POST(event) {
	const uuid = event.params.uuid;
	const packVersion = event.params.version;
	const version = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.packVersion, packVersion)))
	).at(0);
	if (!version) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!version.approved) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	// TODO: Only do this if this IP hasn't already downloaded this? To prevent download inflation by the authors.
	await db
		.update(pack)
		.set({ downloadCount: version.downloadCount + 1 })
		.where(eq(pack.id, version.id));

	const folder = `./static/assets/packs/${version.uuid}/${version.packVersion}`;
	const filename = resolve(folder, `${version.uuid}.7z`);

	// TODO: Is this safe?
	await seven.pack(folder, resolve(folder, `${version.uuid}.7z`));

	const file = await fs.readFile(filename);
	await fs.unlink(filename);

	return new Response(file, {
		headers: {
			"Content-Type": "application/x-7z-compressed",
			"Content-Disposition": `attachment; filename="${version.uuid}.7z"`,
		},
	});
}
