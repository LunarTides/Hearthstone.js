import { db } from "$lib/server/db/index.js";
import type { PackWithExtras } from "$lib/db/schema.js";
import * as table from "$lib/db/schema.js";
import type { Pack } from "$lib/db/schema.js";
import { eq, and, desc, count } from "drizzle-orm";
import { alias, type PgSelect } from "drizzle-orm/pg-core";
import type { ClientUser } from "../auth";
import { censorUser, satisfiesRole } from "$lib/user";

export const isUserMemberOfPack = async (
	clientUser: ClientUser,
	username: string | undefined,
	pack: Pack | undefined,
) => {
	if (!pack || !clientUser) {
		return false;
	}

	if (pack.ownerName === username || satisfiesRole(clientUser, "Moderator")) {
		return true;
	}

	// No group specified.
	if (!username) {
		return false;
	}

	let isInGroup = false;
	const result = (
		await db
			.select({ value: count() })
			.from(table.groupMember)
			.where(
				and(
					eq(table.groupMember.groupName, pack.ownerName),
					eq(table.groupMember.username, username),
					eq(table.groupMember.accepted, true),
				),
			)
			.limit(1)
	)[0];
	isInGroup = result.value > 0;

	return isInGroup;
};

export const getFullPacks = async <T extends PgSelect<"pack">>(
	clientUser: ClientUser | null,
	query: T,
	getMessages = true,
) => {
	const approvedBy = alias(table.user, "approvedBy");

	const packsAndLikes = await query
		.fullJoin(table.user, eq(table.pack.ownerName, table.user.username))
		.fullJoin(table.group, eq(table.pack.ownerName, table.group.username))
		.fullJoin(table.packLike, and(eq(table.pack.ownerName, table.packLike.packOwnerName)))
		.fullJoin(approvedBy, eq(table.pack.approvedBy, approvedBy.username));

	// Show all downloads from all versions.
	let packs: PackWithExtras[] = await Promise.all(
		packsAndLikes
			.filter(async (p) => {
				// Hide unapproved packs from unauthorized users.
				if (p.pack.approved) {
					return true;
				}

				return isUserMemberOfPack(clientUser, clientUser?.username ?? "", p.pack);
			})
			.map(async (p) => {
				const relevantPacks = packsAndLikes.filter((v) => v.pack!.uuid === p.pack!.uuid);

				// NOTE: Can't do `!p.packLike?.dislike` since then an undefined `packLike` will return true.
				const likesPositive = relevantPacks.filter((p) => p.packLike?.dislike === false);
				const likesNegative = relevantPacks.filter((p) => p.packLike?.dislike);
				const likes = new Set(likesPositive.map((p) => p.packLike?.username));
				const dislikes = new Set(likesNegative.map((p) => p.packLike?.username));

				let messages = null;
				if (getMessages) {
					let messagesQuery = db
						.select()
						.from(table.packMessage)
						.where(eq(table.packMessage.packId, p.pack.id))
						.orderBy(desc(table.packMessage.creationDate))
						.fullJoin(table.user, eq(table.packMessage.username, table.user.username))
						.$dynamic();
					if (!satisfiesRole(clientUser, "Moderator")) {
						messagesQuery = messagesQuery.where(
							and(eq(table.packMessage.packId, p.pack.id), eq(table.packMessage.type, "public")),
						);
					}

					messages = await messagesQuery;
				}

				return {
					...p.pack,
					owner: p.user ? censorUser(p.user, clientUser) : p.group,
					totalDownloadCount: relevantPacks
						.map((p) => p.pack!.downloadCount)
						.reduce((p, v) => p + v, 0),
					likes: {
						positive: likes.size,
						hasLiked: clientUser ? likes.has(clientUser.username) : false,
						negative: dislikes.size,
						hasDisliked: clientUser ? dislikes.has(clientUser.username) : false,
					},
					approvedByUser: p.approvedBy ? censorUser(p.approvedBy, clientUser) : null,
					messages: messages?.map((message) => ({
						...message.packMessage,
						author: message.user ? censorUser(message.user, clientUser) : null,
					})),
				};
			}),
	);

	// Remove duplicates.
	const ids = new Set(packsAndLikes.map((p) => p.pack.id));
	packs = packs.filter((p) => ids.delete(p.id));

	return packs;
};

export async function setLatestVersion(ownerName: string, name: string) {
	let packs = await db
		.select({
			id: table.pack.id,
			ownerName: table.pack.ownerName,
			name: table.pack.name,
			packVersion: table.pack.packVersion,
			approved: table.pack.approved,
		})
		.from(table.pack)
		.where(
			and(
				eq(table.pack.ownerName, ownerName),
				eq(table.pack.name, name),
				eq(table.pack.denied, false),
			),
		)
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
		.where(and(eq(table.pack.ownerName, ownerName), eq(table.pack.name, latest.name)));
	const cards = await db
		.select()
		.from(table.card)
		.innerJoin(table.pack, eq(table.pack.id, table.card.packId))
		.where(and(eq(table.pack.ownerName, ownerName), eq(table.pack.name, latest.name)));
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
