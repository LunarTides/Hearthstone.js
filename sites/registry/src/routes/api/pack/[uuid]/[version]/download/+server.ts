import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/server/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import fs from "fs/promises";

export async function POST(event) {
	const id = event.params.version;
	const version = (await db.select().from(pack).where(eq(pack.id, id))).at(0);
	if (!version) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	if (!version.approved) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	const file = await fs.readFile(
		`./static/assets/packs/${version.uuid}/${version.packVersion}/${version.uuid}.7z`,
	);

	return new Response(file, {
		headers: {
			"Content-Type": "application/x-7z-compressed",
			"Content-Disposition": `attachment; filename="${version.uuid}.7z"`,
		},
	});
}
