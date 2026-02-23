import { sfx } from "@Game/functions/audio.ts";
import { createGame } from "@Game/game.ts";
import { Separator, search } from "@inquirer/prompts";
import * as hub from "../../hub.ts";

if (import.meta.main) {
	await createGame();
}

export async function main() {
	const options = {
		multiply: {
			duration: 1,
			hz: 1,
			volume: 1,
		},
	};
	let lastPlayed = "";

	while (true) {
		hub.watermark(false);

		const sound = await search({
			message: "Sound Test",
			source: () => [
				{
					name: "Options",
					value: "options",
				},
				{
					name: "Back",
					value: "back",
				},
				new Separator(),
				...Object.keys(sfx).map((key) => ({
					name: key,
					value: `sfx:${key}`,
				})),
			],
			pageSize: 15,
			default: lastPlayed,
		});

		lastPlayed = sound;

		if (sound === "back") {
			game.functions.audio.playSFX("back");
			break;
		}
		if (sound === "options") {
			game.functions.audio.playSFX("delve");

			await game.prompt.configureObject(options, false, async () => {
				hub.watermark(false);
			});
			continue;
		}

		const key = sound.split(":")[1] as keyof typeof sfx;
		game.functions.audio.playSFX(key, {
			...options,
			playAgainstUserWishes: true,
		});
	}
}

if (import.meta.main) {
	await main();
}
