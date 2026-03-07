import { octaves } from "@Game/modules/audio.ts";
import type { SFX } from "@Game/types.ts";

export const sfx: SFX = {
	name: "discombobulate",

	async play(info, options) {
		game.audio.playWave("saw", octaves[2].A, 1000, 0.3, 0, options);
	},
};
