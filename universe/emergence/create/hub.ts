import type { BlueprintWithOptional } from "@Game/types.ts";
import * as hub from "../../../hub.ts";
import { EMERGENCE_VERSION } from "../lib.ts";
import * as frontend from "./frontend.ts";
import * as lib from "./lib.ts";

export async function takeover() {
	await game.prompt.createUILoop(
		{
			message: `[universe/emergence] v${EMERGENCE_VERSION} > create`,
			callbackBefore: async () => {
				hub.watermark();
			},
		},
		async () =>
			Object.keys(lib.resourceTypeHooks).map((resourceType) => ({
				name: `${resourceType}`,
				callback: async () => {
					// Ask the user to configure the resource.
					const resource = await frontend.configure(
						resourceType as keyof typeof lib.resourceTypeHooks,
					);
					if (!resource) {
						return true;
					}

					// Actually create the resource.
					const result = await lib.create(
						resourceType as keyof typeof lib.resourceTypeHooks,
						resource,
					);
					await lib.postCreate(
						resourceType as keyof typeof lib.resourceTypeHooks,
						resource,
					);

					if (
						resourceType !== "card" ||
						(resource as BlueprintWithOptional).text !== ""
					) {
						// Open the resource in the user's editor.
						game.os.runCommand(
							`${game.config.general.editor} "${result.path}"`,
						);
					}
					return true;
				},
			})),
	);
}
