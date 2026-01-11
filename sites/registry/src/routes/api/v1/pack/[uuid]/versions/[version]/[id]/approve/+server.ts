import { db } from "$lib/server/db/index.js";
import { card, notification, pack, packMessage } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import semver from "semver";
import { resolve } from "$app/paths";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { approveSchema } from "$lib/api/schemas.js";

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

	const version = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.packVersion, packVersion), eq(pack.id, id)))
	).at(0);
	if (!version) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!version.userIds.includes(user.id) && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	const blocking = await db
		.select({ id: pack.id })
		.from(pack)
		.where(and(eq(pack.approved, true), eq(pack.packVersion, version.packVersion)));
	if (blocking.length > 0) {
		return json(
			{ message: `A pack with this version (${version.packVersion}) has already been approved.` },
			{ status: 409 },
		);
	}

	await db
		.update(pack)
		.set({ approved: true, approvedBy: user.id, approvedAt: new Date() })
		.where(eq(pack.id, version.id));
	await db.update(pack).set({ isLatestVersion: false }).where(eq(pack.uuid, version.uuid));
	await db
		.update(card)
		.set({ approved: true, isLatestVersion: false })
		.where(eq(card.packId, version.id));

	const packs = await db
		.select({ id: pack.id, packVersion: pack.packVersion, approved: pack.approved })
		.from(pack)
		.where(eq(pack.uuid, uuid));

	let newLatestPack = packs
		.filter((p) => p.approved)
		.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))
		.at(0);
	if (newLatestPack?.id === version.id) {
		await db.update(pack).set({ isLatestVersion: true }).where(eq(pack.id, newLatestPack.id));
		await db.update(card).set({ isLatestVersion: true }).where(eq(card.packId, newLatestPack.id));
	}

	if (!newLatestPack) {
		newLatestPack = version;
	}

	for (const userId of version.userIds) {
		await db.insert(notification).values({
			userId,
			text: `Your pack (${version.name} v${newLatestPack.packVersion} - ${newLatestPack.id.slice(0, 6)}) has been approved!`,
			route: resolve("/pack/[uuid]/versions/[version]/[id]", {
				uuid: version.uuid,
				version: newLatestPack.packVersion,
				id: newLatestPack.id,
			}),
		});
	}

	await db.insert(packMessage).values({
		packId: newLatestPack.id,
		authorId: user.id,
		type: messageType,
		text: message ? `> Approved this pack: ${message}` : `> Approved this pack.`,
	});

	return json({}, { status: 200 });
}
