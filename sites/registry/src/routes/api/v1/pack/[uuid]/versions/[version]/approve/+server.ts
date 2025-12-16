import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { card, pack } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";
import semver from "semver";

export async function POST(event) {
	const user = event.locals.user;
	if (!user) {
		return json({ message: m.login_required });
	}

	const uuid = event.params.uuid;
	const packVersion = event.params.version;

	const version = (
		await db
			.select()
			.from(pack)
			.where(and(eq(pack.uuid, uuid), eq(pack.packVersion, packVersion)))
	).at(0);
	if (!version) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	if (!version.userIds.includes(user.id) && !satisfiesRole(user, "Moderator")) {
		// TODO: i18n.
		return json({ message: "You do not have the the necessary privileges to do this." });
	}

	await db.update(pack).set({ approved: true }).where(eq(pack.id, version.id));
	await db.update(pack).set({ isLatestVersion: false }).where(eq(pack.uuid, version.uuid));
	await db
		.update(card)
		.set({ approved: true, isLatestVersion: false })
		.where(eq(card.packId, version.id));

	const packs = await db
		.select({ id: pack.id, packVersion: pack.packVersion, approved: pack.approved })
		.from(pack)
		.where(eq(pack.uuid, uuid));

	const newLatestPack = packs
		.filter((p) => p.approved)
		.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))
		.at(0);
	if (newLatestPack?.id === version.id) {
		await db.update(pack).set({ isLatestVersion: true }).where(eq(pack.id, newLatestPack.id));
		await db.update(card).set({ isLatestVersion: true }).where(eq(card.packId, newLatestPack.id));
	}

	return json({}, { status: 200 });
}
