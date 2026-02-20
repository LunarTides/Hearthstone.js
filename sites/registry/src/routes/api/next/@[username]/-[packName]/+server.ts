import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and, desc } from "drizzle-orm";
import fs from "node:fs/promises";
import { getFullPacks, isUserMemberOfPack } from "$lib/server/db/pack.js";
import { censorPack } from "$lib/pack.js";

export async function GET(event) {
	const clientUser = event.locals.user;
	const { username, packName } = event.params;

	let packs = await getFullPacks(
		clientUser,
		db
			.select()
			.from(table.pack)
			.where(and(eq(table.pack.ownerName, username), eq(table.pack.name, packName)))
			.orderBy(desc(table.pack.packVersion))
			.$dynamic(),
	);

	if (!clientUser || !isUserMemberOfPack(clientUser, clientUser.username, packs.at(0))) {
		packs = packs.filter((p) => p.approved);
	}

	return json({
		latest: censorPack(packs[0], clientUser),
		outdated: packs.slice(1).map((p) => censorPack(p, clientUser)),
	});
}

// TODO: Deduplicate.
export async function DELETE(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: "Please log in." });
	}

	const username = event.params.username;
	const packName = event.params.packName;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(and(eq(table.pack.ownerName, username), eq(table.pack.name, packName)))
			.limit(1)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!isUserMemberOfPack(user, username, pack)) {
		return json(
			{ message: "You do not have the the necessary privileges to do this." },
			{ status: 403 },
		);
	}

	// TODO: Delete *all* pack comments.
	await db.delete(table.comment).where(eq(table.comment.packId, pack.id));
	// TODO: Delete *all* pack messages.
	await db.delete(table.packMessage).where(eq(table.packMessage.packId, pack.id));
	await db
		.delete(table.packLike)
		.where(
			and(eq(table.packLike.packOwnerName, pack.ownerName), eq(table.packLike.packName, pack.name)),
		);
	await db
		.delete(table.pack)
		.where(and(eq(table.pack.ownerName, pack.ownerName), eq(table.pack.name, pack.name)));
	// TODO: Make sure this is safe.
	await fs.rm(`./static/assets/packs/${pack.ownerName}/${pack.name}`, {
		force: true,
		recursive: true,
	});

	return json({}, { status: 200 });
}
