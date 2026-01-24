import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";

export async function load(event) {
	// TODO: Stream.
	const parent = await event.parent();

	const members = parent.members;
	const member = members?.find((member) => member.username === event.params.member);
	if (!member) {
		redirect(302, resolve("/@[username]/members", { username: event.params.username }));
	}

	return { currentMember: member };
}
