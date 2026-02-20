import { db } from "$lib/server/db/index.js";
import * as table from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { getFullPackComment } from "$lib/server/db/comment.js";
import type { RequestEvent } from "./$types.js";
import type { ClientUser } from "$lib/server/auth.js";
import { resolve } from "$app/paths";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

async function setup(event: RequestEvent, clientUser: NonNullable<ClientUser>) {
	const username = event.params.username;
	const packName = event.params.packName;

	const pack = (
		await db
			.select()
			.from(table.pack)
			.where(
				and(
					eq(table.pack.ownerName, username),
					eq(table.pack.name, packName),
					eq(table.pack.isLatestVersion, true),
				),
			)
			.limit(1)
	).at(0);
	if (!pack) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	if (!pack.approved && !(await isUserMemberOfGroup(clientUser, clientUser.username, username))) {
		return json({ message: "Version not found." }, { status: 404 });
	}

	const commentId = event.params.commentId;
	const comment = (
		await getFullPackComment(
			clientUser,
			db.select().from(table.comment).where(eq(table.comment.id, commentId)).limit(1).$dynamic(),
		)
	).at(0);
	if (!comment) {
		return json({ message: "No comment found with that id." }, { status: 404 });
	}

	return comment;
}

// TODO: Deduplicate.
export async function POST(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const comment = await setup(event, clientUser);
	if (comment instanceof Response) {
		return comment;
	}

	if (comment.heartedByUsername) {
		return json({ message: "This comment has already been hearted." }, { status: 422 });
	}

	await db
		.update(table.comment)
		.set({
			heartedByUsername: clientUser.username,
		})
		.where(eq(table.comment.id, comment.id));

	if (comment.username && comment.username !== clientUser.username) {
		await db.insert(table.notification).values({
			username: comment.username,
			text: "Your comment has been hearted!",
			route:
				resolve("/@[username]/-[packName]/v[version]/comments", {
					username: comment.pack.ownerName,
					packName: comment.pack.name,
					version: comment.pack.packVersion,
				}) + `#comment-${comment.id}`,
		});
	}

	return json({}, { status: 200 });
}

export async function DELETE(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return json({ message: "Please log in." }, { status: 401 });
	}

	const comment = await setup(event, clientUser);
	if (comment instanceof Response) {
		return comment;
	}

	if (!comment.heartedByUsername) {
		return json({ message: "This comment has not been hearted." }, { status: 422 });
	}

	await db
		.update(table.comment)
		.set({
			heartedByUsername: null,
		})
		.where(eq(table.comment.id, comment.id));

	return json({}, { status: 200 });
}
