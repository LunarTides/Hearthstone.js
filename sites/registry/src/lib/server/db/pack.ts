import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const loadGetPack = async (uuid: string) => {
	// TODO: Add API to get a single card / pack.
	const packs = await db.select().from(pack).where(eq(pack.uuid, uuid));
	if (packs.length <= 0) {
		error(404, { message: m.pack_not_found() });
	}

	const latest = packs.find((p) => p.isLatestVersion);
	if (!latest) {
		error(500, { message: m.drab_less_eel_fetch() });
	}

	return {
		latest: latest,
		all: packs,
	};
};

export const APIGetPack = async (uuid: string) => {
	// TODO: Add API to get a single card / pack.
	const packs = await db.select().from(pack).where(eq(pack.uuid, uuid));
	if (packs.length <= 0) {
		return { error: { message: m.pack_not_found(), status: 404 } };
	}

	const latest = packs.find((p) => p.isLatestVersion);
	if (!latest) {
		return { error: { message: m.drab_less_eel_fetch(), status: 500 } };
	}

	return {
		error: undefined,
		latest: latest,
		all: packs,
	};
};
