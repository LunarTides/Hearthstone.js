import type { Metadata } from "@Game/types/pack.ts";
import type { SFX } from "@Game/types.ts";
import Speaker from "speaker";

const PI = Math.PI;
const TWO_PI = 2 * PI;
const sampleRate = 48000;
let speaker: Speaker;

// https://muted.io/note-frequencies/
export enum Note {
	C = 16.35,
	C_SHARP = 17.32,
	D = 18.35,
	D_SHARP = 19.45,
	E = 20.6,
	F = 21.83,
	F_SHARP = 23.12,
	G = 24.5,
	G_SHARP = 25.96,
	A = 27.5,
	A_SHARP = 29.14,
	B = 30.87,
}

export const octaves = {
	0: {
		C: 16.35,
		C_SHARP: 17.32,
		D: 18.35,
		D_SHARP: 19.45,
		E: 20.6,
		F: 21.83,
		F_SHARP: 23.12,
		G: 24.5,
		G_SHARP: 25.96,
		A: 27.5,
		A_SHARP: 29.14,
		B: 30.87,
	},
	1: {
		C: 32.7,
		C_SHARP: 34.65,
		D: 36.71,
		D_SHARP: 38.89,
		E: 41.2,
		F: 43.65,
		F_SHARP: 46.25,
		G: 49,
		G_SHARP: 51.91,
		A: 55,
		A_SHARP: 58.27,
		B: 61.74,
	},
	2: {
		C: 65.41,
		C_SHARP: 69.3,
		D: 73.42,
		D_SHARP: 77.78,
		E: 82.41,
		F: 87.31,
		F_SHARP: 92.5,
		G: 98,
		G_SHARP: 103.83,
		A: 110,
		A_SHARP: 116.54,
		B: 123.47,
	},
	3: {
		C: 130.81,
		C_SHARP: 138.59,
		D: 146.83,
		D_SHARP: 155.56,
		E: 164.81,
		F: 174.61,
		F_SHARP: 185,
		G: 196,
		G_SHARP: 207.65,
		A: 220,
		A_SHARP: 233.08,
		B: 246.94,
	},
	4: {
		C: 261.63,
		C_SHARP: 277.63,
		D: 293.66,
		D_SHARP: 311.13,
		E: 329.63,
		F: 349.23,
		F_SHARP: 369.99,
		G: 392,
		G_SHARP: 415.3,
		A: 440,
		A_SHARP: 466.16,
		B: 493.88,
	},
	5: {
		C: 523.25,
		C_SHARP: 554.37,
		D: 554.37,
		D_SHARP: 662.25,
		E: 659.25,
		F: 698.46,
		F_SHARP: 739.99,
		G: 783.99,
		G_SHARP: 830.61,
		A: 880,
		A_SHARP: 932.33,
		B: 987.77,
	},
	6: {
		C: 1046.5,
		C_SHARP: 1108.73,
		D: 1174.66,
		D_SHARP: 1244.51,
		E: 1318.51,
		F: 1396.91,
		F_SHARP: 1479.98,
		G: 1567.98,
		G_SHARP: 1661.22,
		A: 1760,
		A_SHARP: 1864.66,
		B: 1975.53,
	},
	7: {
		C: 2093,
		C_SHARP: 2217.46,
		D: 2349.32,
		D_SHARP: 2489,
		E: 2637,
		F: 2793.83,
		F_SHARP: 2959.96,
		G: 3135.96,
		G_SHARP: 3322.44,
		A: 3520,
		A_SHARP: 3729.31,
		B: 3951,
	},
	8: {
		C: 4186,
		C_SHARP: 4434.92,
		D: 4698.63,
		D_SHARP: 4978,
		E: 5274,
		F: 5587.65,
		F_SHARP: 5919.91,
		G: 6271.93,
		G_SHARP: 6644.88,
		A: 7040,
		A_SHARP: 7458.62,
		B: 7902.13,
	},
};

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

export async function addSFX(newSFX: SFX, pack: Metadata) {
	sfx[`@${pack.author}/${pack.name}/${newSFX.name}` as keyof typeof sfx] =
		newSFX.play;
}

// https://easings.net/
const easingFunctions = {
	linear: (x: number) => x,

	// Sine
	sineIn: (x: number) => 1 - Math.cos((x * Math.PI) / 2),
	sineOut: (x: number) => Math.sin((x * Math.PI) / 2),
	sineInOut: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,

	// Quad
	quadIn: (x: number) => x * x,
	quadOut: (x: number) => 1 - (1 - x) * (1 - x),
	quadInOut: (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),

	// Cubic
	cubicIn: (x: number) => x * x * x,
	cubicOut: (x: number) => 1 - (1 - x) ** 3,
	cubicInOut: (x: number) =>
		x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2,

	// Quart
	quartIn: (x: number) => x * x * x * x,
	quartOut: (x: number) => 1 - (1 - x) ** 4,
	quartInOut: (x: number) =>
		x < 0.5 ? 8 * x * x * x * x : 1 - (-2 * x + 2) ** 4 / 2,

	// Quint
	quintIn: (x: number) => x * x * x * x * x,
	quintOut: (x: number) => 1 - (1 - x) ** 5,
	quintInOut: (x: number) =>
		x < 0.5 ? 16 * x * x * x * x * x : 1 - (-2 * x + 2) ** 5 / 2,

	// Expo
	expoIn: (x: number) => (x === 0 ? 0 : 2 ** (10 * x - 10)),
	expoOut: (x: number) => (x === 1 ? 1 : 1 - 2 ** (-10 * x)),
	expoInOut: (x: number) =>
		x === 0
			? 0
			: x === 1
				? 1
				: x < 0.5
					? 2 ** (20 * x - 10) / 2
					: (2 - 2 ** (-20 * x + 10)) / 2,

	// Circ
	circIn: (x: number) => 1 - Math.sqrt(1 - x ** 2),
	circOut: (x: number) => Math.sqrt(1 - (x - 1) ** 2),
	circInOut: (x: number) =>
		x < 0.5
			? (1 - Math.sqrt(1 - (2 * x) ** 2)) / 2
			: (Math.sqrt(1 - (-2 * x + 2) ** 2) + 1) / 2,

	// Back
	backIn: (x: number) => {
		const c1 = 1.70158;
		const c3 = c1 + 1;

		return c3 * x * x * x - c1 * x * x;
	},
	backOut: (x: number) => {
		const c1 = 1.70158;
		const c3 = c1 + 1;

		return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
	},
	backInOut: (x: number) => {
		const c1 = 1.70158;
		const c2 = c1 * 1.525;

		return x < 0.5
			? ((2 * x) ** 2 * ((c2 + 1) * 2 * x - c2)) / 2
			: ((2 * x - 2) ** 2 * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
	},

	// Elastic
	elasticIn: (x: number) => {
		const c4 = (2 * Math.PI) / 3;

		return x === 0
			? 0
			: x === 1
				? 1
				: -(2 ** (10 * x - 10)) * Math.sin((x * 10 - 10.75) * c4);
	},
	elasticOut: (x: number) => {
		const c4 = (2 * Math.PI) / 3;

		return x === 0
			? 0
			: x === 1
				? 1
				: 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
	},
	elasticInOut: (x: number) => {
		const c5 = (2 * Math.PI) / 4.5;

		return x === 0
			? 0
			: x === 1
				? 1
				: x < 0.5
					? -(2 ** (20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
					: (2 ** (-20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
	},

	// Bounce
	bounceIn: (x: number) => 1 - easingFunctions.bounceOut(1 - x),
	bounceOut: (x: number) => {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			x -= 1.5;
			return n1 * (x / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			x -= 2.25;
			return n1 * (x / d1) * x + 0.9375;
		} else {
			x -= 2.625;
			return n1 * (x / d1) * x + 0.984375;
		}
	},
	bounceInOut: (x: number) => {
		return x < 0.5
			? (1 - easingFunctions.bounceOut(1 - 2 * x)) / 2
			: (1 + easingFunctions.bounceOut(2 * x - 1)) / 2;
	},
};

// https://en.wikipedia.org/wiki/List_of_periodic_functions
const waveTypeFunctions = {
	sine: (phase: number) => Math.sin(phase),
	triangle: (phase: number) =>
		(4 / PI) * Math.abs(((((phase - PI / 4) % PI) + PI) % PI) - PI / 2) - 1,
	square: (phase: number, dutyCycle: number) =>
		Math.cos(2 * phase) - Math.cos(PI * dutyCycle) >= 0 ? 1 : 0,
	saw: (phase: number) => 2 * (phase / PI - Math.floor(0.5 + phase / PI)),
	noise: (phase: number) => Math.random(),
};

export interface WaveOptions {
	multiply: {
		duration: number;
		hz: number;
		volume: number;
	};
	sequential: boolean;
}

export const audio = {
	/**
	 * Play a sound effect.
	 *
	 * @param key The sound effect to play. See `src/functions/audio.ts:sfx`
	 * @param info Some information to pass to the sound effect. Some sound effects might be different depending on this information.
	 * @param rawOptions Some options when playing the sound effect.
	 *
	 * @returns If the sound effect was successfully played.
	 */
	async playSFX(
		key: keyof typeof sfx,
		rawOptions?: Partial<{
			info: any;
			options: Partial<WaveOptions>;
			playAgainstUserWishes: boolean;
		}>,
	) {
		const options = {
			info: {} as any,
			playAgainstUserWishes: false,
			...rawOptions,

			options: {
				multiply: {
					duration: 1,
					hz: 1,
					volume: 1,
					...rawOptions?.options?.multiply,
				},

				sequential: true,
				...rawOptions?.options,
			},
		};

		if (
			game.config.audio.disable ||
			(!options.playAgainstUserWishes &&
				(!game.config.audio.sfx.enable ||
					game.config.audio.sfx.blacklist.includes(key))) ||
			game.player.ai
		) {
			return false;
		}

		await sfx[key](options.info, options.options);
		return true;
	},

	/**
	 * The same as {@link game.audio.playSFX}, but this allows playing custom sound effects included in packs.
	 *
	 * @param key The key has to be formatted something like this: "@Official/examples/name-of-sfx".
	 * @param info Some information to pass to the sound effect. Some sound effects might be different depending on this information.
	 * @param rawOptions Some options when playing the sound effect.
	 *
	 * @returns If the sound effect was successfully played.
	 */
	async playCustomSFX(
		key: `@${string}/${string}/${string}`,
		rawOptions?: Partial<{
			info: any;
			options: Partial<WaveOptions>;
			playAgainstUserWishes: boolean;
		}>,
	) {
		return this.playSFX(key as any, rawOptions);
	},

	/**
	 * Setup the game to play sounds. Don't worry about this :)
	 */
	createSpeaker() {
		if (game.config.audio.disable) {
			return;
		}

		if (speaker) {
			return speaker;
		}

		try {
			speaker = new Speaker({
				sampleRate,
				channels: 2,
				bitDepth: 16,
			});
		} catch {
			// No audio device. It's fine...
			game.interest("Opening audio device failed.");
			return;
		}

		return speaker;
	},

	/**
	 * Play a wave with some parameters.
	 *
	 * @param shape The shape of the wave.
	 * @param hz The hertz of the wave. Higher means a higher sound. 440 = A4
	 * @param durationMs How long the wave should play for in milliseconds.
	 * @param volume How loud the wave should be. The default should be good.
	 * @param dutyCycle If you chose to play a square wave, this will be the duty cycle of the wave. You usually want `0.5` or `0.1`.
	 */
	// TODO: Make a function to parse this: "triangle(c2 volume:0.3):1000 triangle(d2):1000" (2 seperate notes played sequentially.)
	// TODO: Add easing functions to volume and dutyCycle.
	async playWave(
		shape:
			| keyof typeof waveTypeFunctions
			| ((phase: number, dutyCycle?: number) => number),
		hz: number,
		durationMs: number,
		volume: number = 0.3,
		delayAfterMs: number = 0,
		dutyCycle = 0.5,
		options: Partial<WaveOptions>,
	): Promise<void> {
		if (game.config.audio.disable) {
			return;
		}

		const speaker = this.createSpeaker();
		if (!speaker) {
			return;
		}

		const waveGenerator =
			typeof shape === "string" ? waveTypeFunctions[shape] : shape;

		// Multiply
		if (options.multiply) {
			hz *= options.multiply.hz;
			durationMs *= options.multiply.duration;
			delayAfterMs *= options.multiply.duration;
			volume *= options.multiply.volume;
		}

		const period = 1 / hz;

		const numFrames = Math.floor((durationMs / 1000) * sampleRate);
		const numSamples = numFrames * 2;
		const numBytes = numSamples * 2; // 16 bits = 2 bytes
		const buffer = Buffer.alloc(numBytes);

		return new Promise((resolve, reject) => {
			let offset = 0;
			for (let i = 0; i < numFrames; i++) {
				const time = i / sampleRate;
				const phase = (time / period) * TWO_PI;

				let sample = waveGenerator(phase, dutyCycle) * volume;
				sample = Math.max(-1, Math.min(1, sample));
				sample = Math.round(sample * 32767);

				// Write to both channels (stereo)
				buffer.writeInt16LE(sample, offset);
				buffer.writeInt16LE(sample, offset + 2);
				offset += 4;
			}

			if (options.sequential) {
				const onDrain = () => {
					speaker.removeListener("drain", onDrain);

					if (delayAfterMs > 0) {
						setTimeout(() => resolve(), delayAfterMs);
					} else {
						resolve();
					}
				};

				speaker.once("drain", onDrain);
				speaker.write(buffer);
			} else {
				speaker.write(buffer);
				resolve();
			}
		});
	},

	/**
	 * Play a sliding wave with some parameters.
	 *
	 * @param shape The shape of the wave.
	 * @param startHz The hertz the wave should start at. Higher means a higher sound. 440 = A4
	 * @param endHz The hertz the wave should be at at the end of the duration.
	 * @param durationMs How long the wave should play for in milliseconds.
	 * @param volume How loud the wave should be. The default should be good.
	 * @param dutyCycle If you chose to play a square wave, this will be the duty cycle of the wave. You usually want `0.5` or `0.1`.
	 */
	async playSlidingWave(
		shape:
			| keyof typeof waveTypeFunctions
			| ((phase: number, dutyCycle?: number) => number),
		startHz: number,
		endHz: number,
		easing: keyof typeof easingFunctions | ((x: number) => number) = "linear",
		durationMs: number,
		volume: number = 0.3,
		delayAfterMs: number = 0,
		dutyCycle = 0.5,
		options: Partial<WaveOptions>,
	): Promise<void> {
		if (game.config.audio.disable) {
			return;
		}

		const waveGenerator =
			typeof shape === "string" ? waveTypeFunctions[shape] : shape;
		const easingFunction =
			typeof easing === "string" ? easingFunctions[easing] : easing;

		// Multiply
		if (options.multiply) {
			startHz *= options.multiply.hz;
			endHz *= options.multiply.hz;
			durationMs *= options.multiply.duration;
			delayAfterMs *= options.multiply.duration;
			volume *= options.multiply.volume;
		}

		const numFrames = Math.floor((durationMs / 1000) * sampleRate);
		const numSamples = numFrames * 2; // 16 bits = 2 bytes
		const numBytes = numSamples * 2;
		const buffer = Buffer.alloc(numBytes);

		const speaker = this.createSpeaker();
		if (!speaker) {
			return;
		}

		return new Promise((resolve, reject) => {
			let hz = startHz;
			let offset = 0;
			for (let i = 0; i < numFrames; i++) {
				// Reduce hz over time
				const easingSample = easingFunction(i / numFrames) / numFrames;
				hz -= (startHz - endHz) * easingSample;

				const period = 1 / hz;
				const time = i / sampleRate;
				const phase = (time / period) * TWO_PI;

				let sample = waveGenerator(phase, dutyCycle) * volume;
				sample = Math.max(-1, Math.min(1, sample));
				sample = Math.round(sample * 32767);

				// Write to both channels (stereo)
				buffer.writeInt16LE(sample, offset);
				buffer.writeInt16LE(sample, offset + 2);
				offset += 4;
			}

			if (options.sequential) {
				const onDrain = () => {
					speaker.removeListener("drain", onDrain);

					if (delayAfterMs > 0) {
						setTimeout(() => resolve(), delayAfterMs);
					} else {
						resolve();
					}
				};

				speaker.once("drain", onDrain);
				speaker.write(buffer);
			} else {
				speaker.write(buffer);
				resolve();
			}
		});
	},
};
