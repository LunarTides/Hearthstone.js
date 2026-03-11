import { redirect } from "@sveltejs/kit";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { userSchema, groupSchema, uploadAvatarSchema } from "./schema";
import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";
import { isUserMemberOfGroup } from "$lib/server/db/group.js";

export const load = async (event) => {
	const clientUser = event.locals.user;
	if (!clientUser) {
		return redirect(302, resolve("/"));
	}

	const uploadAvatarForm = await superValidate(zod4(uploadAvatarSchema));

	const currentUser = await (await event.parent()).currentUser;
	if (!(await isUserMemberOfGroup(clientUser, clientUser.username, currentUser.username))) {
		return redirect(302, resolve("/"));
	}

	if (currentUser.type === "User") {
		const profileForm = await superValidate(
			{
				...currentUser.profile,
				role: currentUser.role,
				type: "User",
			},
			zod4(userSchema),
		);
		return { profileForm, uploadAvatarForm };
	} else {
		const profileForm = await superValidate(
			{
				...currentUser.profile,
				type: "Group",
			},
			zod4(groupSchema),
		);
		return { profileForm, uploadAvatarForm };
	}
};

export const actions = {
	edit: async (event) => {
		const username = event.params.username;

		let profileForm = null;
		const userForm = await superValidate(event.request, zod4(userSchema));
		if (userForm.valid) {
			profileForm = userForm;
		} else {
			const groupForm = await superValidate(event.request, zod4(groupSchema));
			if (!profileForm) {
				profileForm = groupForm;
			}
		}

		if (!profileForm.valid) {
			return fail(400, { form: profileForm });
		}

		const response = await requestAPI(event, resolve("/api/next/@[username]", { username }), {
			method: "PUT",
			body: JSON.stringify(profileForm.data),
		});
		if (response.error) {
			return message(profileForm, response.error.message, { status: response.error.status as any });
		}

		return redirect(302, resolve("/@[username]/settings/profile", { username }));
	},

	uploadAvatar: async (event) => {
		const uploadAvatarForm = await superValidate(event.request, zod4(uploadAvatarSchema));
		if (!uploadAvatarForm.valid) {
			return fail(400, { form: uploadAvatarForm });
		}

		const file = uploadAvatarForm.data.file;

		const buffer = await file.arrayBuffer();
		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]/avatar", { username: event.params.username }),
			{
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: buffer,
			},
		);
		if (response.error) {
			return message(uploadAvatarForm, response.error.message, {
				status: response.error.status as any,
			});
		}

		return { uploadAvatarForm };
	},
};
