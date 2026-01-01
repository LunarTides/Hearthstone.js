import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
	redirect(
		301,
		resolve("/pack/[uuid]/versions/[version]", {
			uuid: event.params.uuid,
			version: event.params.version,
		}),
	);
};
