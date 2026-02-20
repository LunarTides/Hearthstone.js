import { resolve } from "$app/paths";
import { requestAPI } from "$lib/api/helper";
import type { GroupMemberWithExtras } from "$lib/db/schema.js";
import { fail } from "@sveltejs/kit";

export async function load(event) {
	// TODO: Stream.
	const response = await requestAPI<{ members: GroupMemberWithExtras[] }>(
		event,
		resolve("/api/next/@[username]/members", { username: event.params.username }),
	);
	if (response.error) {
		return fail(response.error.status, { message: response.error.message });
	}

	const members = response.json.members;
	return { members };
}
