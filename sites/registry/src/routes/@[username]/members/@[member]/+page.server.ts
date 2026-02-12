import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { requestAPI } from "$lib/api/helper";
import z from "zod";

export async function load(event) {
	// TODO: Stream.
	const clientUser = event.locals.user;
	const form = await superValidate(zod4(z.object()));

	const parent = await event.parent();

	const members = parent.members;
	const member = members?.find((member) => member.username === event.params.member);
	if (!member) {
		redirect(302, resolve("/@[username]/members", { username: event.params.username }));
	}

	const isInvited = !member.accepted && member.username === clientUser?.username;

	return { form, currentMember: member, isInvited };
}

export const actions = {
	acceptInvite: async (event) => {
		const { username, member } = event.params;

		const form = await superValidate(event.request, zod4(z.object()));
		if (!form.valid) {
			return fail(400, { form });
		}

		const response = await requestAPI(
			event,
			resolve("/api/next/groups/@[groupName]/members/invite/accept", { groupName: username }),
			{
				method: "POST",
				body: JSON.stringify(form.data),
			},
		);
		if (response.error) {
			return message(form, response.error.message, { status: response.error.status as any });
		}

		return redirect(302, resolve("/@[username]/members/@[member]", { username, member }));
	},
};
