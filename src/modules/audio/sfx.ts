import type { Metadata } from "@Game/types/pack.ts";
import type { SFX } from "@Game/types.ts";
import { octaves, type WaveOptions } from "./audio.ts";

export async function addSFX(newSFX: SFX, pack?: Metadata) {
	if (pack) {
		sfx[`@${pack.author}/${pack.name}/${newSFX.name}` as keyof typeof sfx] =
			newSFX.play;
	} else {
		sfx[`Custom/${newSFX.name}` as keyof typeof sfx] = newSFX.play;
	}
}

export const sfx = {
	"ui.delve": async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", 440, 50, 0.3, 0, 0, options);
	},

	"ui.back": async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", 220, 50, 0.3, 0, 0, options);
	},

	"ui.delete": async (info: any, options: WaveOptions) => {
		// FIXME: Remove popping in-between.
		await game.audio.playSlidingWave(
			"sine",
			220,
			110,
			"linear",
			50,
			0.3,
			0,
			0.0,
			options,
		);
		await game.audio.playSlidingWave(
			"sine",
			110,
			220,
			"linear",
			50,
			0.3,
			0,
			0.0,
			options,
		);
	},

	"ui.leaveLoop": async (info: any, options: WaveOptions) => {
		await game.audio.playSlidingWave(
			"sine",
			440,
			220,
			"linear",
			100,
			0.3,
			10,
			0.0,
			options,
		);
		await game.audio.playSlidingWave(
			"sine",
			220,
			440,
			"linear",
			100,
			0.3,
			0,
			0.0,
			options,
		);
	},

	"ui.action1": async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", 440, 50, 0.3, 10, 0.0, options);
		await game.audio.playSlidingWave(
			"sine",
			540,
			440,
			"linear",
			100,
			0.3,
			0,
			0.0,
			options,
		);
	},

	"input.type": async (info: any, options: WaveOptions) => {
		await game.audio.playWave(
			"sine",
			440 + game.lodash.random(-50, 50),
			10,
			0.3,
			0,
			0.0,
			options,
		);
	},

	"input.backspace": async (info: any, options: WaveOptions) => {
		await game.audio.playWave(
			"sine",
			220 + game.lodash.random(-50, 50),
			10,
			0.3,
			0,
			0.0,
			options,
		);
	},

	"input.tab": async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", 440, 10, 0.3, 10, 0.0, options);
		await game.audio.playWave("sine", 500, 10, 0.3, 10, 0.0, options);
		await game.audio.playWave("sine", 550, 10, 0.3, 0, 0.0, options);
	},

	"input.arrow.up": async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", octaves[5].A, 10, 0.3, 50, 0.0, options);
		await game.audio.playWave("sine", octaves[5].A, 10, 0.3, 0, 0.0, options);
	},

	"input.arrow.down": async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", octaves[4].A, 10, 0.3, 50, 0.0, options);
		await game.audio.playWave("sine", octaves[4].A, 10, 0.3, 0, 0.0, options);
	},

	"input.enter": async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", 880, 10, 0.3, 0, 0.0, options);
	},

	"game.playCard": async (info: any, options: WaveOptions) => {
		// TODO: Make less obnoxious.
		await game.audio.playWave(
			"triangle",
			octaves[3].A,
			150,
			0.3,
			10,
			0.0,
			options,
		);

		await game.audio.playSlidingWave(
			"triangle",
			octaves[3].A,
			octaves[3].C,
			"linear",
			150,
			0.3,
			10,
			0.0,
			options,
		);

		await game.audio.playWave(
			"triangle",
			octaves[3].C,
			50,
			0.3,
			10,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].C_SHARP,
			50,
			0.3,
			10,
			0.0,
			options,
		);

		await game.audio.playWave(
			"triangle",
			octaves[3].A,
			150,
			0.3,
			0,
			0.0,
			options,
		);
	},

	"game.endTurn": async (info: any, options: WaveOptions) => {
		// Echo effect.
		await game.audio.playWave("sine", octaves[4].A, 200, 0.2, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[4].A, 200, 0.1, 50, 0.0, options);

		await game.audio.playWave("sine", octaves[4].A, 200, 0.1, 10, 0.0, options);
		await game.audio.playWave(
			"sine",
			octaves[4].A,
			200,
			0.05,
			50,
			0.0,
			options,
		);

		await game.audio.playWave(
			"sine",
			octaves[4].A,
			200,
			0.05,
			10,
			0.0,
			options,
		);
		await game.audio.playWave(
			"sine",
			octaves[4].A,
			200,
			0.025,
			50,
			0.0,
			options,
		);

		await game.audio.playWave(
			"sine",
			octaves[4].A,
			200,
			0.025,
			10,
			0.0,
			options,
		);
		await game.audio.playWave(
			"sine",
			octaves[4].A,
			200,
			0.0125,
			0,
			0.0,
			options,
		);
	},

	error: async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", 220, 50, 0.3, 50, 0.0, options);
		await game.audio.playWave("sine", 110, 100, 0.3, 0, 0.0, options);
	},

	unnamed1: async (info: any, options: WaveOptions) => {
		await game.audio.playWave("sine", octaves[5].A, 100, 0.3, 10, 0.0, options);
		await game.audio.playWave(
			"sine",
			octaves[6].C_SHARP,
			200,
			0.3,
			50,
			0.0,
			options,
		);

		await game.audio.playWave(
			"sine",
			octaves[5].G_SHARP,
			50,
			0.3,
			10,
			0.0,
			options,
		);
		await game.audio.playWave("sine", octaves[5].A, 50, 0.3, 10, 0.0, options);
		await game.audio.playWave(
			"sine",
			octaves[6].C_SHARP,
			200,
			0.3,
			0,
			0.0,
			options,
		);
	},

	soundTest: async (info: any, options: WaveOptions) => {
		// C-Major Scale
		await game.audio.playWave("sine", octaves[4].C, 200, 2, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[4].D, 200, 1, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[4].E, 200, 0.3, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[4].F, 200, 0.3, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[4].G, 200, 0.3, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[4].A, 200, 0.3, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[4].B, 200, 0.3, 10, 0.0, options);
		await game.audio.playWave("sine", octaves[5].C, 200, 0.3, 10, 0.0, options);

		// Square Test
		await game.audio.playWave(
			"square",
			octaves[0].C,
			500,
			0.3,
			10,
			0.9,
			options,
		);
		await game.audio.playWave(
			"square",
			octaves[1].C,
			500,
			0.3,
			10,
			0.75,
			options,
		);
		await game.audio.playWave(
			"square",
			octaves[2].C,
			1000,
			0.3,
			10,
			0.5,
			options,
		);
		await game.audio.playWave(
			"square",
			octaves[3].C,
			500,
			0.3,
			10,
			0.25,
			options,
		);
		await game.audio.playWave(
			"square",
			octaves[4].C,
			500,
			0.3,
			10,
			0.1,
			options,
		);
		await game.audio.playWave(
			"square",
			octaves[5].C,
			500,
			0.3,
			10,
			0.1,
			options,
		);

		// Saw Test
		await game.audio.playWave("saw", octaves[0].C, 500, 0.3, 10, 0.0, options);
		await game.audio.playWave("saw", octaves[1].C, 500, 0.3, 10, 0.0, options);
		await game.audio.playWave("saw", octaves[2].C, 1000, 0.3, 10, 0.0, options);
		await game.audio.playWave("saw", octaves[3].C, 500, 0.3, 10, 0.0, options);
		await game.audio.playWave("saw", octaves[4].C, 500, 0.3, 10, 0.0, options);
		await game.audio.playWave("saw", octaves[5].C, 500, 0.3, 10, 0.0, options);

		await game.audio.playSlidingWave(
			"sine",
			octaves[6].C,
			octaves[7].C,
			"linear",
			500,
			0.3,
			10,
			0.0,
			options,
		);
		await game.audio.playSlidingWave(
			"saw",
			octaves[2].C,
			octaves[3].C,
			"linear",
			500,
			0.3,
			10,
			0.0,
			options,
		);
		await game.audio.playSlidingWave(
			"triangle",
			octaves[2].C,
			octaves[3].C,
			"linear",
			500,
			0.3,
			10,
			0.0,
			options,
		);
		await game.audio.playSlidingWave(
			"square",
			octaves[3].C,
			octaves[4].C,
			"linear",
			500,
			0.3,
			10,
			0.9,
			options,
		);
		await game.audio.playSlidingWave(
			"square",
			octaves[4].C,
			octaves[2].C,
			"linear",
			500,
			0.3,
			10,
			0.9,
			options,
		);
		await game.audio.playSlidingWave(
			"square",
			octaves[6].C,
			octaves[1].C,
			"linear",
			1000,
			0.3,
			10,
			0.1,
			options,
		);
		await game.audio.playSlidingWave(
			"square",
			octaves[8].C,
			octaves[0].C,
			"linear",
			5000,
			0.3,
			10,
			0.1,
			options,
		);

		// Test Song
		options.multiply.duration /= 2;

		await game.audio.playWave(
			"triangle",
			octaves[3].C,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].D,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].E,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].F,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].G,
			1000,
			0.3,
			100,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].G,
			1000,
			0.3,
			100,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].A,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].A,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].A,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].A,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].G,
			1000,
			0.3,
			1000,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].F,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].F,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].F,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].F,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].E,
			1000,
			0.3,
			100,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].E,
			1000,
			0.3,
			100,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].D,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].D,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].D,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].D,
			500,
			0.3,
			25,
			0.0,
			options,
		);
		await game.audio.playWave(
			"triangle",
			octaves[3].C,
			1000,
			0.3,
			0,
			0.0,
			options,
		);

		options.multiply.duration *= 2;
	},
};
