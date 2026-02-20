import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { resolve } from "$app/paths";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { approveSchema } from "../../../../../../@[username]/-[packName]/v[version]/schema";
import { setLatestVersion } from "$lib/server/db/pack.js";
import { grantKarma } from "$lib/server/db/user.js";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export async function POST(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const { username, packName, version: packVersion } = event.params;
	const j = await event.request.json();

	const form = await superValidate(j, zod4(approveSchema));
	if (!form.valid) {
		return json(
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const { message, messageType, karma } = form.data;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!(await isUserMemberOfGroup(user, user.username, username))) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	if (pack.approved) {
		return json({ message: "This pack has already been approved." }, { status: 403 });
	}

	await db
		.update(table.pack)
		.set({ approved: true, approvedBy: user.username, approvedAt: new Date(), denied: false })
		.where(eq(table.pack.id, pack.id));

	await db
		.update(table.card)
		.set({ approved: true, isLatestVersion: false })
		.where(eq(table.card.packId, pack.id));

	await setLatestVersion(username, packName);

	const packMessage = await db
		.insert(table.packMessage)
		.values({
			packId: pack.id,
			username: user.username,
			type: messageType,
			text: message ? `> Approved this pack: ${message}` : `> Approved this pack.`,
		})
		.returning({ id: table.packMessage.id });

	await db.insert(table.notification).values({
		username,
		text: `Your pack (${pack.name} v${pack.packVersion} has been approved!`,
		route:
			resolve("/@[username]/-[packName]/v[version]/comments", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
			}) + `#message-${packMessage[0].id}`,
	});

	await grantKarma(username, karma);
	return json({}, { status: 200 });
}

// TODO: Deduplicate from POST.
export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const { username, packName, version: packVersion } = event.params;
	const j = await event.request.json();

	const form = await superValidate(j, zod4(approveSchema));
	if (!form.valid) {
		return json(
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const { message, messageType, karma } = form.data;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!(await isUserMemberOfGroup(user, user.username, username))) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	if (!pack.approved) {
		return json({ message: "This pack isn't approved." }, { status: 403 });
	}

	await db
		.update(table.pack)
		.set({ approved: false, approvedBy: null, approvedAt: null })
		.where(eq(table.pack.id, pack.id));

	await db
		.update(table.card)
		.set({ approved: false, isLatestVersion: false })
		.where(eq(table.card.packId, pack.id));

	await setLatestVersion(username, packName);

	const packMessage = await db
		.insert(table.packMessage)
		.values({
			packId: pack.id,
			username: user.username,
			type: messageType,
			text: message
				? `> Withdrew their approval from this pack: ${message}`
				: `> Withdrew their approval from this pack.`,
		})
		.returning({ id: table.packMessage.id });

	// FIXME: This breaks when approving a pack owned by a group.
	await db.insert(table.notification).values({
		username,
		text: `Your pack (${pack.name} v${pack.packVersion} approval has been withdrawn!`,
		route:
			resolve("/@[username]/-[packName]/v[version]/comments", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
			}) + `#message-${packMessage[0].id}`,
	});

	await grantKarma(username, -karma);
	return json({}, { status: 200 });
}
