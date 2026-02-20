import { resolve } from "$app/paths";
import * as table from "$lib/db/schema";
import { censorGroup } from "$lib/group.js";
import { db } from "$lib/server/db";
import { RoleTable, censorUser, satisfiesRole } from "$lib/user.js";
import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { userSchema, groupSchema } from "../../../@[username]/settings/profile/schema.js";

export async function GET(event) {
	const clientUser = event.locals.user;
	const username = event.params.username;

	const users = await db
		.select()
		.from(table.user)
		.where(eq(table.user.username, username))
		.innerJoin(table.userProfile, eq(table.userProfile.username, table.user.username));
	if (users.length <= 0) {
		const groups = await db
			.select()
			.from(table.group)
			.where(eq(table.group.username, username))
			.innerJoin(table.groupProfile, eq(table.groupProfile.username, table.group.username));
		if (groups.length <= 0) {
			return json({ message: "User not found." }, { status: 404 });
		}

		const group = groups[0];

		return json(
			{
				ownerType: "Group",
				profile: group.groupProfile,
				...censorGroup(group.group, clientUser),
			},
			{ status: 200 },
		);
	}

	const user = users[0];

	return json(
		{
			ownerType: "User",
			profile: user.userProfile,
			...censorUser(user.user, clientUser),
		},
		{ status: 200 },
	);
}

// TODO: Make this work for groups.
export async function PUT(event) {
	const clientUser = event.locals.user;
	if (!clientUser) {
		error(401, { message: "Please log in." });
	}

	const username = event.params.username;

	if (clientUser.username !== username && !satisfiesRole(clientUser, "Admin")) {
		error(403, { message: "You do not have the the necessary privileges to do this." });
	}

	const j = await event.request.json();

	let form = null;
	const userForm = await superValidate(j, zod4(userSchema));
	let groupForm;
	if (userForm.valid) {
		form = userForm;
	} else {
		groupForm = await superValidate(j, zod4(groupSchema));
		if (!form) {
			form = groupForm;
		}
	}

	if (!form.valid) {
		return json(
			{ message: `Invalid request. (${form.errors._errors?.join(", ")})` },
			{ status: 422 },
		);
	}

	const aboutMe = form.data.aboutMe;

	let group = undefined;
	const user = (await db.select().from(table.user).where(eq(table.user.username, username))).at(0);
	if (!user) {
		group = (await db.select().from(table.group).where(eq(table.group.username, username))).at(0);
		if (!group) {
			return json({ message: "User not found." }, { status: 404 });
		}
	}

	if (user) {
		// User
		const pronouns = userForm.data.pronouns;
		const role = userForm.data.role;

		let newRole = userForm.role;

		// Only allow admins and up to change the role of users.
		if (role && satisfiesRole(clientUser, "Admin")) {
			newRole = role;

			if (role !== user.role) {
				const a = RoleTable[role];
				const b = RoleTable[user.role];

				let message;

				if (a < b) {
					message = `You have been demoted to ${role}!`;
				} else {
					message = `You have been promoted to ${role}!`;
				}

				await db.insert(table.notification).values({
					username: user.username,
					text: message,
					route: resolve("/@[username]", { username: user.username }),
				});
			}
		}

		const updatedUsers = await db
			.update(table.user)
			.set({
				role: newRole,
			})
			.where(eq(table.user.username, username))
			.returning();
		const updatedProfiles = await db
			.update(table.userProfile)
			.set({
				pronouns,
				aboutMe: aboutMe?.replaceAll("\r\n", "\n"),
			})
			.where(eq(table.userProfile.username, user.username))
			.returning();

		const userInfo = updatedUsers.length > 0 ? [censorUser(updatedUsers[0], clientUser)] : [];

		return json({
			...userInfo,
			profile: updatedProfiles.at(0),
		});
	} else if (group) {
		// Group
		const updatedProfiles = await db
			.update(table.groupProfile)
			.set({
				aboutMe: aboutMe?.replaceAll("\r\n", "\n"),
			})
			.where(eq(table.groupProfile.username, group.username))
			.returning();

		return json({
			...censorGroup(group, clientUser),
			profile: updatedProfiles.at(0),
		});
	}
}
