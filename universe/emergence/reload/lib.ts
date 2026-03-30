import { register } from "../register/lib.ts";

const resourceTypeFunctions = {
	card: async () => {
		game.blueprints = [];
	},
	command: async () => {
		// TODO: Reload commands #478
	},
	sfx: async () => {
		// TODO: Reload sfx #478
	},
};

export async function reload(
	resourceType: "all" | keyof typeof resourceTypeFunctions = "all",
) {
	if (resourceType === "all") {
		for (const func of Object.values(resourceTypeFunctions)) {
			await func();
		}
	} else {
		// Find the resource type function.
		const func = resourceTypeFunctions[
			resourceType as keyof typeof resourceTypeFunctions
		] as typeof resourceTypeFunctions.card | undefined;

		if (!func) {
			throw new Error(`Resource type '${resourceType}' cannot be handled.`);
		}

		await func();
	}

	for (const key of Object.keys(require.cache)) {
		if (key.includes("/packs/") || key.includes("\\packs\\")) {
			delete require.cache[key];
		}
	}

	await register(resourceType);
}
