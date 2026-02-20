import { redirect } from "@sveltejs/kit";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { userSchema, groupSchema } from "./schema";
import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export const load = async (event) => {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return redirect(302, resolve("/"));
	}

	const currentUser = await (await event.parent()).currentUser;
	if (!(await isUserMemberOfGroup(clientUser, clientUser.username, currentUser.username))) {
		return redirect(302, resolve("/"));
	}

	if (currentUser.type === "User") {
		const form = await superValidate(
			{
				...currentUser.profile,
				role: currentUser.role,
				type: "User",
			},
			zod4(userSchema),
		);
		return { form };
	} else {
		const form = await superValidate(
			{
				...currentUser.profile,
				type: "Group",
			},
			zod4(groupSchema),
		);
		return { form };
	}
};

export const actions = {
	edit: async (event) => {
		const username = event.params.username;

		let form = null;
		const userForm = await superValidate(event.request, zod4(userSchema));
		if (userForm.valid) {
			form = userForm;
		} else {
			const groupForm = await superValidate(event.request, zod4(groupSchema));
			if (!form) {
				form = groupForm;
			}
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(event, resolve("/api/next/@[username]", { username }), {
			method: "PUT",
			body: JSON.stringify(form.data),
		});
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		return redirect(302, resolve("/@[username]/settings/profile", { username }));
	},
};
