import { octaves } from "@Game/modules/audio.ts";
import type { SFX } from "@Game/types.ts";

export const sfx: SFX = {
	name: "discombobulate",

	async play(info, options) {
		game.audio.playWave("noise", octaves[0].A, 400, 0.4, 0, options);
		game.audio.playSlidingWave(
			(phase) => Math.sin(phase) + Math.cos(phase) * Math.PI,
			octaves[0].A,
			octaves[1].A,
			4000,
			0.5,
			0.9,
			options,
		);

		game.audio.wait(500, options);
		game.audio.playWave("saw", octaves[1].A, 1000, 0.3, 0, options);
		game.audio.playWave("square", octaves[1].A, 1000, 0.5, 0.5, options);
		game.audio.playWave("square", octaves[1].A, 1000, 0.5, 0.9, options);
		game.audio.playSlidingWave(
			"square",
			octaves[1].A,
			octaves[0].A,
			1000,
			0.5,
			0.9,
			options,
		);
		game.audio.wait(500, options);
		game.audio.playWave(
			(phase) => Math.sin(phase) + Math.cos(phase) * phase,
			octaves[0].A,
			2000,
			0.5,
			0.9,
			options,
		);
	},
};
