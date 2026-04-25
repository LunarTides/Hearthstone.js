import { octaves } from "@Game/modules/audio/audio.ts";
import type { SFX } from "@Game/types.ts";

export const sfx: SFX = {
	name: "discombobulate",
	id: "019dc4f5-da95-7481-b31a-2623bd71665c",

	async play(info, options) {
		await game.audio.playWave("noise", octaves[0].A, 400, 0.4, 0, 0, options);
		await game.audio.playSlidingWave(
			(phase) => Math.sin(phase) + Math.cos(phase) * Math.PI,
			octaves[0].A,
			octaves[1].A,
			"linear",
			4000,
			0.5,
			1000,
			0.9,
			options,
		);

		// FIXME: This doesn't work.
		await game.audio.playWave("saw", octaves[1].A, 1000, 0.3, 0, 0, {
			...options,
			sequential: false,
		});
		await game.audio.playWave(
			"square",
			octaves[2].A,
			200,
			0.5,
			0,
			0.5,
			options,
		);
		await game.audio.playWave(
			"square",
			octaves[1].A,
			1000,
			0.5,
			0,
			0.9,
			options,
		);
		await game.audio.playSlidingWave(
			"square",
			octaves[1].A,
			octaves[0].A,
			"linear",
			1000,
			0.5,
			1000,
			0.9,
			options,
		);
		await game.audio.playWave(
			(phase) => Math.sin(phase) + Math.cos(phase) * phase,
			octaves[0].A,
			2000,
			0.5,
			0,
			0.9,
			options,
		);
	},
};
