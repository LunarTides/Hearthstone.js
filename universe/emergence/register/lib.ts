import { addCommand } from "@Game/commands.ts";
import { addSFX } from "@Game/modules/audio/sfx.ts";
import { PackValidationResult } from "@Game/types/pack.ts";
import type { Blueprint, Command, SFX } from "@Game/types.ts";

const resourceTypeFunctions = {
	card: async (path: string) => {
		const blueprint = (await import(path)).blueprint as Blueprint;
		game.blueprints.push(blueprint);
	},
	command: async (path: string) => {
		const command = (await import(path)).command as Command;
		await addCommand(command);
	},
	sfx: async (path: string) => {
		const pack = (await game.card.getPackMetadataFromCardPath(path))!;

		const sfx = (await import(path)).sfx as SFX;
		await addSFX(sfx, pack);
	},
};

export async function register(
	resourceType: "all" | keyof typeof resourceTypeFunctions = "all",
) {
	await game.fs.searchCardsFolder(
		async (fullPath, content, file, index, fileResourceType) => {
			if (resourceType !== "all" && resourceType !== fileResourceType) {
				// The resource shouldn't be registered.
				return;
			}

			// Check if the associated pack is valid.
			switch (await game.card.validatePackFromPath(fullPath)) {
				case PackValidationResult.InvalidGameVersion:
					throw new Error(
						`The pack associated with '${fullPath}' is made for a different version of the game.`,
					);

				// These are success-codes.
				case PackValidationResult.NoPack:
				case PackValidationResult.Success: {
				}
			}

			// Find the resource type function.
			const func = resourceTypeFunctions[
				fileResourceType as keyof typeof resourceTypeFunctions
			] as typeof resourceTypeFunctions.card | undefined;

			if (!func) {
				throw new Error(
					`Resource type '${fileResourceType}' cannot be handled.`,
				);
			}

			await func(fullPath);
		},
	);

	// TODO: Should we do this here?
	if (!game.card.runBlueprintValidator()) {
		throw new Error(
			"Some cards are invalid. Please fix these issues before playing.",
		);
	}
}
