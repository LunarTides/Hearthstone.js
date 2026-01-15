import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import semver from "semver";
import { resolve } from "$app/paths";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { approveSchema } from "$lib/api/schemas.js";
import { notify } from "$lib/server/helper.js";

export async function POST(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const uuid = event.params.uuid;
	const packVersion = event.params.version;
	const id = event.params.id;

	const j = await event.request.json();

	const form = await superValidate(j, zod4(approveSchema));
	if (!form.valid) {
		return json(
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const message = form.data.message;
	const messageType = form.data.messageType;

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

	if (!pack.userIds.includes(user.id) && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	const blocking = await db
		.select({ id: table.pack.id })
		.from(table.pack)
		.where(and(eq(table.pack.approved, true), eq(table.pack.packVersion, pack.packVersion)));
	if (blocking.length > 0) {
		return json(
			{ message: `A pack with this version (${pack.packVersion}) has already been approved.` },
			{ status: 409 },
		);
	}

	await db
		.update(table.pack)
		.set({ approved: true, approvedBy: user.id, approvedAt: new Date() })
		.where(eq(table.pack.id, pack.id));

	await db
		.update(table.card)
		.set({ approved: true, isLatestVersion: false })
		.where(eq(table.card.packId, pack.id));

	const packs = await db
		.select({
			id: table.pack.id,
			packVersion: table.pack.packVersion,
			approved: table.pack.approved,
		})
		.from(table.pack)
		.where(eq(table.pack.uuid, uuid));

	let newLatestPack = packs
		.filter((p) => p.approved)
		.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))
		.at(0);
	if (newLatestPack?.id === pack.id) {
		// Demote other packs / cards.
		await db
			.update(table.pack)
			.set({ isLatestVersion: false })
			.where(eq(table.pack.uuid, pack.uuid));
		const cards = await db
			.select()
			.from(table.card)
			.innerJoin(table.pack, eq(table.pack.id, table.card.packId))
			.where(eq(table.pack.uuid, pack.uuid));
		for (const c of cards) {
			if (c.card.packId !== pack.id) {
				await db
					.update(table.card)
					.set({ isLatestVersion: false })
					.where(eq(table.card.id, c.card.id));
			}
		}

		// Promote currnet (latest) pack.
		await db
			.update(table.pack)
			.set({ isLatestVersion: true })
			.where(eq(table.pack.id, newLatestPack.id));
		await db
			.update(table.card)
			.set({ isLatestVersion: true })
			.where(eq(table.card.packId, newLatestPack.id));
	}

	if (!newLatestPack) {
		newLatestPack = pack;
	}

	const packMessage = await db
		.insert(table.packMessage)
		.values({
			packId: newLatestPack.id,
			authorId: user.id,
			type: messageType,
			text: message ? `> Approved this pack: ${message}` : `> Approved this pack.`,
		})
		.returning({ id: table.packMessage.id });

	for (const userId of pack.userIds) {
		await notify(event, {
			userId,
			text: `Your pack (${pack.name} v${newLatestPack.packVersion} - #${newLatestPack.id.slice(0, 6)}) has been approved!`,
			route:
				resolve("/pack/[uuid]/versions/[version]/[id]", {
					uuid: pack.uuid,
					version: newLatestPack.packVersion,
					id: newLatestPack.id,
				}) + `#message-${packMessage[0].id}`,
		});
	}

	return json({}, { status: 200 });
}
