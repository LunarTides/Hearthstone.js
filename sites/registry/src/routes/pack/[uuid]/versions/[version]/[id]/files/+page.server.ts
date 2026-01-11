import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
	redirect(
		301,
		resolve("/pack/[uuid]/versions/[version]/[id]", {
			uuid: event.params.uuid,
			version: event.params.version,
			id: event.params.id,
		}),
	);
};
