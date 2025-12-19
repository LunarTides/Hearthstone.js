import { m } from "$lib/paraglide/messages.js";
import { db } from "$lib/server/db/index.js";
import { pack, packComment } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { satisfiesRole } from "$lib/user.js";

export async function DELETE(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: m.login_required() }, { status: 401 });
	}

	const uuid = event.params.uuid;
	const commentId = event.params.commentId;
	const packs = await db.select().from(pack).where(eq(pack.uuid, uuid)).limit(1);
	if (packs.length <= 0) {
		return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
	}

	const p = packs.find((p) => p.isLatestVersion) ?? packs[0];
	if (!p.approved) {
		if (
			clientUser &&
			(p.userIds.includes(clientUser.id) || satisfiesRole(clientUser, "Moderator"))
		) {
            // eslint-disable no-empty
		} else {
			return json({ message: m.illegal_bog_like_salmon() }, { status: 404 });
		}
	}

	if (!p.userIds.includes(clientUser.id) && !satisfiesRole(clientUser, "Moderator")) {
		// TODO: i18n.
		return json({ message: "You do not have the the necessary privileges to do this." });
	}

	await db.delete(packComment).where(eq(packComment.id, commentId));

	return json({}, { status: 200 });
}
