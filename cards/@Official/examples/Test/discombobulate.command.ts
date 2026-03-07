import type { Command } from "@Game/types.ts";

export const command: Command = {
	name: "discombobulate",
	description: "Discombobulate a card. (Example custom command.)",
	debug: true,

	async run(args, useTUI) {
		const card = await game.prompt.targetCard(
			"Which card do you want to discombobulate?",
			undefined,
		);
		if (!card) {
			return false;
		}

		await card.setStats(card.attack, -99);
		await card.bounce();
		return true;
	},
};
