import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack, packLike, type PackWithExtras } from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import type { ClientUser } from "../auth";
import { satisfiesRole } from "$lib/user";
import semver from "semver";

const filterApproved = (user: ClientUser, packs: PackWithExtras[]) => {
	if ((!user || !packs.at(0)?.userIds.includes(user.id)) && !satisfiesRole(user, "Moderator")) {
		return packs.filter((p) => p.approved);
	}

	return packs;
};

export const loadGetPack = async (user: ClientUser, uuid: string) => {
	// TODO: Add API to get a single card / pack.
	let packs = await getFullPacks(
		user,
		db.select().from(pack).where(eq(pack.uuid, uuid)).$dynamic(),
	);

	packs = filterApproved(user, packs);

	if (packs.length <= 0) {
		// To to parse uuid as a version id.
		const id = (await db.select({ uuid: pack.uuid }).from(pack).where(eq(pack.id, uuid))).at(0);
		if (!id) {
			error(404, { message: m.pack_not_found() });
		}

		packs = await getFullPacks(
			user,
			db.select().from(pack).where(eq(pack.uuid, id.uuid)).$dynamic(),
		);

		packs = filterApproved(user, packs);
	}

	let latest = packs.find((p) => p.isLatestVersion);
	if (!latest) {
		latest = packs.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))[0];
	}

	return {
		latest: latest,
		all: packs,
	};
};

export const APIGetPack = async (user: ClientUser, uuid: string) => {
	// TODO: Add API to get a single card / pack.
	let packs = await getFullPacks(
		user,
		db.select().from(pack).where(eq(pack.uuid, uuid)).$dynamic(),
	);

	packs = filterApproved(user, packs);

	if (packs.length <= 0) {
		return { error: { message: m.pack_not_found(), status: 404 } };
	}

	let latest = packs.find((p) => p.isLatestVersion);
	if (!latest) {
		latest = packs.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))[0];
	}

	return {
		error: undefined,
		latest: latest,
		all: packs,
	};
};

export const getFullPacks = async <T extends PgSelect<"pack">>(
	user: ClientUser | null,
	query: T,
) => {
	const packsAndLikes = await query.fullJoin(packLike, eq(pack.uuid, packLike.packId));

	// Show all downloads from all versions.
	let packs: PackWithExtras[] = packsAndLikes.map((p) => {
		const relevantPacks = packsAndLikes.filter((v) => v.pack!.uuid === p.pack!.uuid);

		// NOTE: Can't do `!p.packLike?.dislike` since then an undefined `packLike` will return true.
		const likesPositive = relevantPacks.filter((p) => p.packLike?.dislike === false);
		const likesNegative = relevantPacks.filter((p) => p.packLike?.dislike);
		const likes = new Set(likesPositive.map((p) => p.packLike?.userId));
		const dislikes = new Set(likesNegative.map((p) => p.packLike?.userId));

		return {
			...p.pack,
			totalDownloadCount: relevantPacks
				.map((p) => p.pack!.downloadCount)
				.reduce((p, v) => p + v, 0),
			likes: {
				positive: likes.size,
				hasLiked: user ? likes.has(user.id) : false,
				negative: dislikes.size,
				hasDisliked: user ? dislikes.has(user.id) : false,
			},
		};
	});

	// Remove duplicates.
	const ids = new Set(packsAndLikes.map((p) => p.pack.id));
	packs = packs.filter((p) => ids.delete(p.id));

	return packs;
};
