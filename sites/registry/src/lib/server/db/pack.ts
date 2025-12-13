import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack, packLike, type PackWithExtras } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import { getAllDownloads } from "$lib/pack";

export const loadGetPack = async (user: any, uuid: string) => {
	// TODO: Add API to get a single card / pack.
	const packs = await getFullPacks(
		user,
		db.select().from(pack).where(eq(pack.uuid, uuid)).$dynamic(),
	);
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

export const APIGetPack = async (user: any, uuid: string) => {
	// TODO: Add API to get a single card / pack.
	const packs = await getFullPacks(
		user,
		db.select().from(pack).where(eq(pack.uuid, uuid)).$dynamic(),
	);
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

// TODO: Add type for user.
export const getFullPacks = async <T extends PgSelect<"pack">>(user: any | null, query: T) => {
	const packsAndLikes = await query.fullJoin(packLike, eq(pack.uuid, packLike.packId));

	// Show all downloads from all versions.
	const packs: PackWithExtras[] = packsAndLikes.map((p) => {
		const relevantPacks = packsAndLikes.filter((v) => v.pack!.uuid === p.pack!.uuid);
		const likes = new Set(relevantPacks.filter((p) => p.packLike).map((p) => p.packLike?.userId));

		return {
			...p.pack,
			downloadCount: getAllDownloads(relevantPacks.map((p) => p.pack!)),
			likes: likes.size,
			hasLiked: user ? likes.has(user.id) : false,
		};
	});

	return packs;
};
