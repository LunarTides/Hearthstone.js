import { createGame } from "@Game/game.ts";
import { sfx } from "@Game/modules/audio/sfx.ts";
import { Separator, search } from "@inquirer/prompts";
import * as hub from "../../hub.ts";

if (import.meta.main) {
	await createGame();
}

export async function main() {
	if (game.config.audio.disable) {
		console.error(
			"<red>The audio engine is disabled. Please ensure that 'Audio > Disable' is 'false'.</red>\n",
		);
		await game.pause();
		return;
	}

	const options = {
		multiply: {
			duration: 1,
			hz: 1,
			volume: 1,
		},
		sequential: true,
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
				new Separator(),
				{
					name: "Soundbyte 1",
					value: "soundbyte1",
				},
			],
			pageSize: 15,
			default: lastPlayed,
		});

		lastPlayed = sound;

		if (sound === "back") {
			game.audio.playSFX("ui.back");
			break;
		}
		if (sound === "options") {
			game.audio.playSFX("ui.delve");

			await game.prompt.configureObject(options, false, async () => {
				hub.watermark(false);
			});
			continue;
		}
		if (sound === "soundbyte1") {
			const soundbyte = "tri(c4,vol:0.5):1000 sin(c4,vol:0.3):500";
			console.log(`Playing: ${soundbyte}`);
			game.audio.playAudioCode(soundbyte);
			await game.pause();
			continue;
		}

		const key = sound.split(":")[1] as keyof typeof sfx;
		game.audio.playSFX(key, {
			options,
			playAgainstUserWishes: true,
		});
	}
}

if (import.meta.main) {
	await main();
}
