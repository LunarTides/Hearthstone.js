import { db } from "$lib/server/db/index.js";
import type { PackWithExtras } from "$lib/db/schema.js";
import * as table from "$lib/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq, and, desc } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import type { ClientUser } from "../auth";
import { censorUser, satisfiesRole } from "$lib/user";
import semver from "semver";
import { censorPack } from "$lib/pack";

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
		db.select().from(table.pack).where(eq(table.pack.uuid, uuid)).$dynamic(),
	);

	packs = filterApproved(user, packs);

	if (packs.length <= 0) {
		// To to parse uuid as a version id.
		const id = (
			await db.select({ uuid: table.pack.uuid }).from(table.pack).where(eq(table.pack.id, uuid))
		).at(0);
		if (!id) {
			error(404, { message: "Pack not found." });
		}

		packs = await getFullPacks(
			user,
			db.select().from(table.pack).where(eq(table.pack.uuid, id.uuid)).$dynamic(),
		);

		packs = filterApproved(user, packs);
	}

	const censoredPacks = packs.map((p) => censorPack(p, user));

	let latest = censoredPacks.find((p) => p.isLatestVersion);
	if (!latest) {
		latest = censoredPacks.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))[0];
	}

	return {
		latest: latest,
		all: censoredPacks,
	};
};

export const APIGetPack = async (user: ClientUser, uuid: string) => {
	// TODO: Add API to get a single card / pack.
	let packs = await getFullPacks(
		user,
		db.select().from(table.pack).where(eq(table.pack.uuid, uuid)).$dynamic(),
	);

	packs = filterApproved(user, packs);

	if (packs.length <= 0) {
		return { error: { message: "Pack not found.", status: 404 } };
	}

	const censoredPacks = packs.map((p) => censorPack(p, user));

	let latest = censoredPacks.find((p) => p.isLatestVersion);
	if (!latest) {
		latest = censoredPacks.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))[0];
	}

	return {
		error: undefined,
		latest: latest,
		all: censoredPacks,
	};
};

export const getFullPacks = async <T extends PgSelect<"pack">>(
	clientUser: ClientUser | null,
	query: T,
) => {
	const packsAndLikes = await query
		.fullJoin(table.packLike, eq(table.pack.uuid, table.packLike.packId))
		.fullJoin(table.user, eq(table.pack.approvedBy, table.user.id));

	// Show all downloads from all versions.
	let packs: PackWithExtras[] = await Promise.all(
		packsAndLikes
			.filter((p) => {
				// Hide unapproved packs from unauthorized users.
				if (p.pack.approved) {
					return true;
				}

				if (
					(clientUser && p.pack.userIds.includes(clientUser.id)) ||
					satisfiesRole(clientUser, "Moderator")
				) {
					return true;
				}

				return false;
			})
			.map(async (p) => {
				const relevantPacks = packsAndLikes.filter((v) => v.pack!.uuid === p.pack!.uuid);

				// NOTE: Can't do `!p.packLike?.dislike` since then an undefined `packLike` will return true.
				const likesPositive = relevantPacks.filter((p) => p.packLike?.dislike === false);
				const likesNegative = relevantPacks.filter((p) => p.packLike?.dislike);
				const likes = new Set(likesPositive.map((p) => p.packLike?.userId));
				const dislikes = new Set(likesNegative.map((p) => p.packLike?.userId));

				let messagesQuery = db
					.select()
					.from(table.packMessage)
					.where(eq(table.packMessage.packId, p.pack.id))
					.orderBy(desc(table.packMessage.creationDate))
					.fullJoin(table.user, eq(table.packMessage.authorId, table.user.id))
					.$dynamic();
				if (!satisfiesRole(clientUser, "Moderator")) {
					messagesQuery = messagesQuery.where(
						and(eq(table.packMessage.packId, p.pack.id), eq(table.packMessage.type, "public")),
					);
				}

				const messages = await messagesQuery;

				return {
					...p.pack,
					totalDownloadCount: relevantPacks
						.map((p) => p.pack!.downloadCount)
						.reduce((p, v) => p + v, 0),
					likes: {
						positive: likes.size,
						hasLiked: clientUser ? likes.has(clientUser.id) : false,
						negative: dislikes.size,
						hasDisliked: clientUser ? dislikes.has(clientUser.id) : false,
					},
					approvedByUser:
						p.user && satisfiesRole(clientUser, "Moderator") ? censorUser(p.user) : null,
					messages: messages.map((message) => ({
						...message.packMessage,
						author: message.user ? censorUser(message.user) : null,
					})),
				};
			}),
	);

	// Remove duplicates.
	const ids = new Set(packsAndLikes.map((p) => p.pack.id));
	packs = packs.filter((p) => ids.delete(p.id));

	return packs;
};

export async function setLatestVersion(uuid: string) {
	let packs = await db
		.select({
			id: table.pack.id,
			uuid: table.pack.uuid,
			packVersion: table.pack.packVersion,
			approved: table.pack.approved,
		})
		.from(table.pack)
		.where(eq(table.pack.uuid, uuid))
		.orderBy(desc(table.pack.packVersion));

	{
		const filtered = packs.filter((pack) => pack.approved);
		if (filtered.length > 0) {
			packs = filtered;
		}
	}

	const latest = packs[0];
	if (!latest) {
		return;
	}

	// Demote other packs / cards.
	await db
		.update(table.pack)
		.set({ isLatestVersion: false })
		.where(eq(table.pack.uuid, latest.uuid));
	const cards = await db
		.select()
		.from(table.card)
		.innerJoin(table.pack, eq(table.pack.id, table.card.packId))
		.where(eq(table.pack.uuid, latest.uuid));
	for (const c of cards) {
		// TODO: Should the latest version of a card be true if there is no earlier version of that card even though that version isn't the latest version?
		if (c.card.packId !== latest.id) {
			await db
				.update(table.card)
				.set({ isLatestVersion: false })
				.where(eq(table.card.id, c.card.id));
		}
	}

	// Promote currnet (latest) pack.
	await db.update(table.pack).set({ isLatestVersion: true }).where(eq(table.pack.id, latest.id));
	await db
		.update(table.card)
		.set({ isLatestVersion: true })
		.where(eq(table.card.packId, latest.id));
}
