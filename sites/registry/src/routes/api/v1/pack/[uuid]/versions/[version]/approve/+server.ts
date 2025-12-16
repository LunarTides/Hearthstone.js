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

	const packs = await db
		.select({ id: pack.id, packVersion: pack.packVersion })
		.from(pack)
		.where(eq(pack.uuid, uuid));

	await db.update(pack).set({ isLatestVersion: false }).where(eq(pack.uuid, version.uuid));
	await db.update(card).set({ isLatestVersion: false }).where(eq(card.packId, version.id));

	const newLatestPack = packs
		.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))
		.at(0);
	if (newLatestPack) {
		await db.update(pack).set({ isLatestVersion: true }).where(eq(pack.id, newLatestPack.id));
		await db.update(card).set({ isLatestVersion: true }).where(eq(card.packId, newLatestPack.id));
	}

	// const otherVersions = await db
	//     .select()
	//     .from(pack)
	//     .where(eq(pack.uuid, version.uuid));
	// for (const version of otherVersions) {
	//     if (semver.eq(metadata.versions.pack, version.packVersion)) {
	//         // TODO: Add ability for the uploader to limit who can edit the pack.
	//         if (version.userIds.includes(user.id)) {
	//             // Override.
	//             updateDB = async (values: InferInsertModel<typeof pack>) =>
	//                 db.update(pack).set(values).where(eq(pack.id, version.id)).returning({ id: pack.id });
	//             // update = true;
	//         } else {
	//             // No permission.
	//             error(403, m.fluffy_bluffy_biome_mall());
	//         }
	//     } else if (semver.gt(metadata.versions.pack, version.packVersion)) {
	//         // TODO: Only do this when the pack is approved. If the approval process is disabled, do this here.
	//         if (false) {
	//             if (version.isLatestVersion) {
	//                 await db.update(pack).set({ isLatestVersion: false }).where(eq(pack.id, version.id));

	//                 const cards = await db.select().from(card).where(eq(card.packId, version.id));
	//                 for (const c of cards) {
	//                     for (const file of files) {
	//                         if (!file.name.endsWith(".ts")) {
	//                             continue;
	//                         }

	//                         const content = await fs.readFile(resolve(tmpPath, file.name), "utf8");
	//                         const uuid = parseCardField(content, "id");

	//                         if (c.uuid === uuid) {
	//                             await db.update(card).set({ isLatestVersion: false }).where(eq(card.id, c.id));
	//                         }
	//                     }
	//                 }
	//             }
	//         }
	//     }

	//     // If there exists a later version in the db, this version is not the latest one.
	//     else if (semver.lt(metadata.versions.pack, version.packVersion)) {
	//         isLatestVersion = false;
	//     }
	// }

	return json({}, { status: 200 });
}
