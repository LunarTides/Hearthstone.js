import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function load(event) {
	const uuid = event.params.uuid;

	const p = await db.select().from(pack).where(eq(pack.uuid, uuid)).limit(1);
	if (p.length <= 0) {
		error(404, { message: m.pack_not_found() });
	}

	return {
		pack: p[0],
	};
}
