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

// TODO: Deduplicate from `approve`.
export async function POST(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const username = event.params.username;
	const packName = event.params.packName;
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
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
					eq(table.pack.id, id),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (pack.ownerName !== user.username && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db
		.update(table.pack)
		.set({ approved: false, approvedBy: null, approvedAt: null, denied: true })
		.where(eq(table.pack.id, pack.id));

	await db
		.update(table.card)
		.set({ approved: false, isLatestVersion: false })
		.where(eq(table.card.packId, pack.id));

	await setLatestVersion(username, packName);

	const packMessage = await db
		.insert(table.packMessage)
		.values({
			packId: id,
			username: user.username,
			type: messageType,
			text: message ? `> Denied this pack: ${message}` : `> Denied this pack.`,
		})
		.returning({ id: table.packMessage.id });

	await notify(event, {
		username,
		text: `Your pack (${pack.name} v${pack.packVersion} - #${pack.id.split("-").at(-1)!.slice(0, 6)}) has been denied.`,
		route:
			resolve("/@[username]/-[packName]/versions/[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}) + `#message-${packMessage[0].id}`,
	});

	return json({}, { status: 200 });
}

// TODO: Deduplicate from POST.
export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const username = event.params.username;
	const packName = event.params.packName;
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
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.packVersion, packVersion),
					eq(table.pack.id, id),
				),
			)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (pack.ownerName !== user.username && !satisfiesRole(user, "Moderator")) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	await db.update(table.pack).set({ denied: false }).where(eq(table.pack.id, pack.id));

	const packMessage = await db
		.insert(table.packMessage)
		.values({
			packId: id,
			username: user.username,
			type: messageType,
			text: message
				? `> Removed deny tag from this pack: ${message}`
				: `> Removed deny tag from this pack.`,
		})
		.returning({ id: table.packMessage.id });

	await notify(event, {
		username,
		text: `Your pack (${pack.name} v${pack.packVersion} - #${pack.id.split("-").at(-1)!.slice(0, 6)}) is being reconsidered for approval!`,
		route:
			resolve("/@[username]/-[packName]/versions/[version]/[id]", {
				username: pack.ownerName,
				packName: pack.name,
				version: pack.packVersion,
				id: pack.id,
			}) + `#message-${packMessage[0].id}`,
	});

	return json({}, { status: 200 });
}
