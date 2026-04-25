import type { Command } from "@Game/types.ts";

export const command: Command = {
	name: "discombobulate",
	description: "Discombobulate a card. (Example custom command.)",
	debug: true,
	id: "019dc4ee-04af-7000-9df0-3fc4093e65a7",

	async run(args, useTUI) {
		const card = await game.prompt.targetCard(
			"Which card do you want to discombobulate?",
			undefined,
		);
		if (!card) {
			return false;
		}

		game.audio.playCustomSFX(game.ids.Official.examples.sfx.discombobulate[0]);

		await card.setStats(card.attack, -99);
		await card.bounce();
		return true;
	},
};
