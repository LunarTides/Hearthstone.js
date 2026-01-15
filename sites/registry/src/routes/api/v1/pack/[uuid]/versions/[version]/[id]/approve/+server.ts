import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import { resolve } from "$app/paths";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { approveSchema } from "$lib/api/schemas.js";
import { notify } from "$lib/server/helper.js";
import { setLatestVersion } from "$lib/server/db/pack.js";

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

	await setLatestVersion(uuid);

	const packMessage = await db
		.insert(table.packMessage)
		.values({
			packId: id,
			authorId: user.id,
			type: messageType,
			text: message ? `> Approved this pack: ${message}` : `> Approved this pack.`,
		})
		.returning({ id: table.packMessage.id });

	for (const userId of pack.userIds) {
		await notify(event, {
			userId,
			text: `Your pack (${pack.name} v${pack.packVersion} - #${pack.id.slice(0, 6)}) has been approved!`,
			route:
				resolve("/pack/[uuid]/versions/[version]/[id]", {
					uuid: pack.uuid,
					version: pack.packVersion,
					id: pack.id,
				}) + `#message-${packMessage[0].id}`,
		});
	}

	return json({}, { status: 200 });
}

export async function DELETE(event) {
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

	await db
		.update(table.pack)
		.set({ approved: false, approvedBy: null, approvedAt: null })
		.where(eq(table.pack.id, pack.id));

	await db
		.update(table.card)
		.set({ approved: false, isLatestVersion: false })
		.where(eq(table.card.packId, pack.id));

	await setLatestVersion(uuid);

	const packMessage = await db
		.insert(table.packMessage)
		.values({
			packId: id,
			authorId: user.id,
			type: messageType,
			text: message
				? `> Withdrew their approval from this pack: ${message}`
				: `> Withdrew their approval from this pack.`,
		})
		.returning({ id: table.packMessage.id });

	for (const userId of pack.userIds) {
		await notify(event, {
			userId,
			text: `Your pack (${pack.name} v${pack.packVersion} - #${pack.id.slice(0, 6)}) has been approved!`,
			route:
				resolve("/pack/[uuid]/versions/[version]/[id]", {
					uuid: pack.uuid,
					version: pack.packVersion,
					id: pack.id,
				}) + `#message-${packMessage[0].id}`,
		});
	}

	return json({}, { status: 200 });
}
