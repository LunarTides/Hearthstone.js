import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
	const parent = await event.parent();
	const latest = (await parent.cards).packs.latest;

	redirect(
		302,
		resolve("/card/[uuid]/versions/[version]/[id]", {
			uuid: event.params.uuid,
			version: latest.packVersion,
			id: latest.id,
		}),
	);
};
