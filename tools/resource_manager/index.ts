import { createGame } from "@Game/game.ts";
import * as hub from "../../hub.ts";
import * as classCreator from "./class.ts";
import * as vcc from "./vanilla_card.ts";

// FIXME: Some tools don't work when run directly.
if (import.meta.main) {
	await createGame();
}

export async function main() {
	await game.prompt.createUILoop(
		{
			message: "Manage Resources",
			callbackBefore: async () => {
				hub.watermark();
				console.log(
					"<yellow>This tool is in a transition phase. It will likely be replaced soon. See Universe > [emergence] to create other types of resources.</yellow>",
				);
				console.log();
			},
		},
		async () => [
			{
				name: "Import a Vanilla Card",
				defaultSound: false,
				callback: async () => {
					game.audio.playSFX("ui.leaveLoop");
					await vcc.main();
					return true;
				},
			},
			{
				name: "Create a Class",
				defaultSound: false,
				callback: async (answer: number) => {
					game.audio.playSFX("ui.leaveLoop");
					await classCreator.main();
					return true;
				},
			},
		],
	);
}

if (import.meta.main) {
	await main();
}
