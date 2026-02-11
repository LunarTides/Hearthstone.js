import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";
import type { CensoredGroup } from "$lib/group";
import { error } from "@sveltejs/kit";

export async function load(event) {
	// TODO: Stream.
	const response = await requestAPI<{ groups: CensoredGroup[] }>(
		event,
		resolve("/api/next/groups/user/@[username]/is-member-of", { username: event.params.username }),
	);
	if (response.error) {
		return error(response.error.status, { message: response.error.message });
	}

	const groups = response.json.groups;
	return { groups };
}
