import { resolve } from "$app/paths";
import { notification, profile, user } from "$lib/db/schema";
import { db } from "$lib/server/db";
import { RoleTable, censorUser, satisfiesRole } from "$lib/user.js";
import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function GET(event) {
	const uuid = event.params.uuid;

	const users = await db
		.select()
		.from(user)
		.where(eq(user.id, uuid))
		.innerJoin(profile, eq(profile.userId, user.id));
	if (users.length <= 0) {
		return json({ message: "User not found." }, { status: 404 });
	}

	const u = users[0];

	return json(
		{
			profile: u.profile,
			...censorUser(u.user),
		},
		{ status: 200 },
	);
}

export async function PUT(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		error(401, { message: "Please log in." });
	}

	const uuid = event.params.uuid;

	if (clientUser.id !== uuid && !satisfiesRole(clientUser, "Admin")) {
		error(403, { message: "You do not have the the necessary privileges to do this." });
	}

	const u = (await db.select().from(user).where(eq(user.id, uuid))).at(0);
	if (!u) {
		return json({ message: "User not found." }, { status: 404 });
	}

	const body = JSON.parse(await event.request.text());

	let role = u.role;

	// Only allow admins and up to change the role of users.
	if (satisfiesRole(clientUser, "Admin")) {
		role = body.role;

		if (role !== u.role) {
			const a = RoleTable[role];
			const b = RoleTable[u.role];

			let message;

			if (a < b) {
				message = `You have been demoted to ${role}!`;
			} else {
				message = `You have been promoted to ${role}!`;
			}

			await db.insert(notification).values({
				userId: u.id,
				text: message,
				route: resolve("/user/[uuid]", { uuid: u.id }),
			});
		}
	}

	// TODO: Check if the username is taken.
	const updatedUsers = await db
		.update(user)
		.set({
			username: body.username,
			role,
		})
		.where(eq(user.id, uuid))
		.returning();
	const updatedProfiles = await db
		.update(profile)
		.set({
			pronouns: body.pronouns,
			aboutMe: body.aboutMe.replaceAll("\r\n", "\n"),
		})
		.where(eq(profile.userId, uuid))
		.returning();

	const userInfo = updatedUsers.length > 0 ? [censorUser(updatedUsers[0])] : [];

	return json({
		...userInfo,
		profile: updatedProfiles.at(0),
	});
}
