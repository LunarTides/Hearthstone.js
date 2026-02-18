import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper.js";
import type { PackWithExtras } from "$lib/db/schema.js";
import { satisfiesRole } from "$lib/user.js";
import { error, fail } from "@sveltejs/kit";

// TODO: Deduplicate from `pack/[uuid]/+layout.server.ts`
export const load = async (event) => {
	// TODO: Stream like in `routes/+layout.server.ts`.
	const username = event.params.username;

	const packResponse = await requestAPI<
		{
			name: string;
			versions: {
				latest: PackWithExtras;
				outdated: PackWithExtras[];
			};
		}[]
	>(event, resolve("/api/next/@[username]/packs", { username }));
	if (packResponse.error) {
		return error(packResponse.error.status, packResponse.error.message);
	}

	const packs = packResponse.json;
	if (packs.length <= 0) {
		return {
			packs: [],
			cards: [],
		};
	}

	return {
		packs,
	};
};

export const actions = {
	edit: async (event) => {
		const user = event.locals.user;
		if (!user) {
			return fail(401, { message: "Please log in." });
		}

		const username = event.params.username;

		if (user.username !== username && !satisfiesRole(user, "Admin")) {
			return fail(403, { message: "You do not have the the necessary privileges to do this." });
		}

		const formData = await event.request.formData();
		const response = await requestAPI(
			event,
			resolve("/api/next/@[username]", {
				username,
			}),
			{
				method: "PUT",
				body: JSON.stringify({
					username: formData.get("username"),
					pronouns: formData.get("pronouns"),
					aboutMe: (formData.get("aboutMe") as string | null)?.replaceAll("\r\n", "\n"),
					role: formData.get("role"),
				}),
			},
		);
		if (response.error) {
			return fail(response.error.status, { message: response.error.message });
		}
	},
};
