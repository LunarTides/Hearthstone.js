import sdl from "@kmamal/sdl";

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

const TWO_PI = 2 * Math.PI;
let playback: sdl.Sdl.Audio.AudioPlaybackInstance;
let channels = 0,
	frequency = 0,
	bytesPerSample = 0,
	minSampleValue = 0,
	maxSampleValue = 0,
	zeroSampleValue = 0;

let octaves: ReturnType<typeof audioFunctions.getOctave>[] = [];

export const sfx = {
	delve: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		await game.functions.audio.playWave(
			"sine",
			440 * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	back: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		await game.functions.audio.playWave(
			"sine",
			220 * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	leaveUILoop: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		await game.functions.audio.playSlidingWave(
			"sine",
			880 * hzMultiplier,
			440 * hzMultiplier,
			100 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	// TODO: Rename
	cool: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playWave(
			"sine",
			440 * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		await game.functions.audio.playSlidingWave(
			"sine",
			880 * hzMultiplier,
			440 * hzMultiplier,
			100 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	type: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playWave(
			"sine",
			(440 + game.lodash.random(-50, 50)) * hzMultiplier,
			10 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	backspace: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playWave(
			"sine",
			(220 + game.lodash.random(-50, 50)) * hzMultiplier,
			10 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	enter: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playWave(
			"sine",
			880 * hzMultiplier,
			10 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	tab: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playWave(
			"sine",
			440 * hzMultiplier,
			10 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		game.functions.audio.wait(10);

		game.functions.audio.playWave(
			"sine",
			500 * hzMultiplier,
			10 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		game.functions.audio.wait(10);

		game.functions.audio.playWave(
			"sine",
			550 * hzMultiplier,
			10 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	error: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playWave(
			"sine",
			220 * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		game.functions.audio.wait(50);

		game.functions.audio.playWave(
			"sine",
			110 * hzMultiplier,
			100 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	delete: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playSlidingWave(
			"sine",
			440 * hzMultiplier,
			450 * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	playCard: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		game.functions.audio.playWave(
			"triangle",
			octaves[4].A * hzMultiplier,
			150 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		game.functions.audio.playSlidingWave(
			"triangle",
			octaves[4].A * hzMultiplier,
			octaves[4].A_SHARP * hzMultiplier,
			150 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		game.functions.audio.playWave(
			"triangle",
			octaves[4].A * hzMultiplier,
			150 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	_playCard: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		// TODO: Make less obnoxious.
		game.functions.audio.playSlidingWave(
			"sine",
			octaves[6].C * hzMultiplier,
			octaves[6].C_SHARP * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[6].C_SHARP * hzMultiplier,
			100 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		game.functions.audio.wait(50 * durationMultiplier);

		game.functions.audio.playWave(
			"sine",
			octaves[5].G_SHARP * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[5].A * hzMultiplier,
			50 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[6].C_SHARP * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},

	endTurn: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		// Echo effect.
		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.2 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.1 * volumeMultiplier,
		);

		game.functions.audio.wait(50 * durationMultiplier);

		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.1 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.05 * volumeMultiplier,
		);

		game.functions.audio.wait(50 * durationMultiplier);

		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.05 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.025 * volumeMultiplier,
		);

		game.functions.audio.wait(50 * durationMultiplier);

		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.025 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.0125 * volumeMultiplier,
		);
	},

	soundTest: async (
		info: any,
		durationMultiplier: number,
		hzMultiplier: number,
		volumeMultiplier: number,
	) => {
		// C-Major Scale
		game.functions.audio.playWave(
			"sine",
			octaves[4].C * hzMultiplier,
			200 * durationMultiplier,
			2 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].D * hzMultiplier,
			200 * durationMultiplier,
			1 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].E * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].F * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].G * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].A * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[4].B * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"sine",
			octaves[5].C * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		// Square Test
		game.functions.audio.playWave(
			"square",
			octaves[2].C * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
			0.9,
		);
		game.functions.audio.playWave(
			"square",
			octaves[3].C * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
			0.75,
		);
		game.functions.audio.playWave(
			"square",
			octaves[4].C * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
			0.5,
		);
		game.functions.audio.playWave(
			"square",
			octaves[5].C * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
			0.25,
		);
		game.functions.audio.playWave(
			"square",
			octaves[6].C * hzMultiplier,
			200 * durationMultiplier,
			0.3 * volumeMultiplier,
			0.1,
		);

		// Saw Test
		game.functions.audio.playWave(
			"saw",
			octaves[0].C * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"saw",
			octaves[2].C * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"saw",
			octaves[3].C * hzMultiplier,
			2000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"saw",
			octaves[4].C * hzMultiplier,
			100 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playWave(
			"saw",
			octaves[5].C * hzMultiplier,
			100 * durationMultiplier,
			0.3 * volumeMultiplier,
		);

		game.functions.audio.playSlidingWave(
			"sine",
			octaves[6].C * hzMultiplier,
			octaves[7].C * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playSlidingWave(
			"saw",
			octaves[3].C * hzMultiplier,
			octaves[4].C * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playSlidingWave(
			"triangle",
			octaves[3].C * hzMultiplier,
			octaves[4].C * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.playSlidingWave(
			"square",
			octaves[3].C * hzMultiplier,
			octaves[4].C * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
			0.9,
		);

		// Test Song
		durationMultiplier /= 2;

		game.functions.audio.playWave(
			"triangle",
			octaves[4].C * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].D * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].E * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].F * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].G * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(100 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].G * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(100 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].A * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].A * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].A * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].A * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].G * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(1000 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].F * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].F * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].F * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].F * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].E * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(100 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].E * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(100 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].D * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].D * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].D * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].D * hzMultiplier,
			500 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
		game.functions.audio.wait(25 * durationMultiplier);
		game.functions.audio.playWave(
			"triangle",
			octaves[4].C * hzMultiplier,
			1000 * durationMultiplier,
			0.3 * volumeMultiplier,
		);
	},
};

// TODO: Use better, more accurate, functions.
const waveTypeFunctions = {
	sine: (phase: number) => Math.sin(phase),
	triangle: (phase: number) =>
		4 * Math.abs(phase / 6.3 - Math.floor(phase / 6.3 + 0.5)) - 1,
	square: (phase: number, dutyCycle: number) =>
		Math.sign(dutyCycle - (phase / 10 - Math.floor(phase / 10))),
	saw: (phase: number) => 2 * (phase / 6.6 - Math.floor(0.5 + phase / 6.6)),
};

export const audioFunctions = {
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
			multiply: Partial<{
				duration: number;
				hz: number;
				volume: number;
			}>;
			playAgainstUserWishes: boolean;
		}>,
	) {
		const options = {
			info: {} as any,
			playAgainstUserWishes: false,
			...rawOptions,

			multiply: {
				duration: 1,
				hz: 1,
				volume: 1,
				...rawOptions?.multiply,
			},
		};

		if (
			game.config.audio.disable ||
			!game.config.audio.sfx.enable ||
			(!options.playAgainstUserWishes &&
				game.config.audio.sfx.blacklist.includes(key)) ||
			game.player.ai
		) {
			return false;
		}

		await sfx[key](
			options.info,
			options.multiply.duration!,
			options.multiply.hz!,
			options.multiply.volume!,
		);
		return true;
	},

	/**
	 * Setup the game to play sounds. Don't worry about this :)
	 */
	setupPlayback() {
		if (game.config.audio.disable) {
			return;
		}

		this.close();

		try {
			playback = sdl.audio.openDevice({ type: "playback" });
		} catch {
			// No audio device. It's fine...
			game.interest("Opening audio device failed.");
			return;
		}

		channels = playback.channels;
		frequency = playback.frequency;
		bytesPerSample = playback.bytesPerSample;
		minSampleValue = playback.minSampleValue;
		maxSampleValue = playback.maxSampleValue;
		zeroSampleValue = playback.zeroSampleValue;

		octaves = [
			this.getOctave(0),
			this.getOctave(1),
			this.getOctave(2),
			this.getOctave(3),
			this.getOctave(4),
			this.getOctave(5),
			this.getOctave(6),
			this.getOctave(7),
			this.getOctave(8),
		];
	},

	/**
	 * Close the audio channel.
	 */
	close() {
		if (game.config.audio.disable || !playback) {
			return;
		}

		playback.close();
	},

	/**
	 * Return the hertz corresponding to notes at a specific octave.
	 */
	getOctave(octave: number) {
		return {
			C: Note.C * 2 ** octave,
			C_SHARP: Note.C_SHARP * 2 ** octave,
			D: Note.D * 2 ** octave,
			D_SHARP: Note.D_SHARP * 2 ** octave,
			E: Note.E * 2 ** octave,
			F: Note.F * 2 ** octave,
			F_SHARP: Note.F_SHARP * 2 ** octave,
			G: Note.G * 2 ** octave,
			G_SHARP: Note.G_SHARP * 2 ** octave,
			A: Note.A * 2 ** octave,
			A_SHARP: Note.A_SHARP * 2 ** octave,
			B: Note.B * 2 ** octave,
		};
	},

	/**
	 * Adds a pause to the audio stream.
	 *
	 * @param durationMs How many milliseconds to pause for.
	 */
	async wait(durationMs: number) {
		if (game.config.audio.disable) {
			return;
		}

		// Write empty bytes to the channel.
		const numFrames = (durationMs / 1000) * frequency;
		const numSamples = numFrames * channels;
		const numBytes = numSamples * bytesPerSample;
		const buffer = Buffer.alloc(numBytes);

		let offset = 0;
		for (let i = 0; i < numFrames; i++) {
			for (let j = 0; j < channels; j++) {
				offset = playback.writeSample(buffer, zeroSampleValue, offset);
			}
		}

		playback.enqueue(buffer);
		playback.play();
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
	async playWave(
		shape: keyof typeof waveTypeFunctions,
		hz: number,
		durationMs: number,
		volume: number = 0.3,
		dutyCycle = 0.5,
	) {
		if (game.config.audio.disable) {
			return;
		}

		const range = maxSampleValue - minSampleValue;

		const amplitude = (range / 2) * volume;
		const period = 1 / hz;

		const numFrames = (durationMs / 1000) * frequency;
		const numSamples = numFrames * channels;
		const numBytes = numSamples * bytesPerSample;
		const buffer = Buffer.alloc(numBytes);

		let offset = 0;
		for (let i = 0; i < numFrames; i++) {
			const time = i / frequency;
			const phase = (time / period) * TWO_PI;

			const sample =
				zeroSampleValue +
				waveTypeFunctions[shape](phase, dutyCycle) * amplitude;

			for (let j = 0; j < channels; j++) {
				offset = playback.writeSample(buffer, sample, offset);
			}
		}

		playback.enqueue(buffer);
		playback.play();
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
		shape: keyof typeof waveTypeFunctions,
		startHz: number,
		endHz: number,
		durationMs: number,
		volume: number = 0.3,
		dutyCycle = 0.5,
	) {
		if (game.config.audio.disable) {
			return;
		}

		const range = maxSampleValue - minSampleValue;

		const amplitude = (range / 2) * volume;

		const numFrames = (durationMs / 1000) * frequency;
		const numSamples = numFrames * channels;
		const numBytes = numSamples * bytesPerSample;
		const buffer = Buffer.alloc(numBytes);

		let hz = startHz;
		let offset = 0;
		for (let i = 0; i < numFrames; i++) {
			hz -= endHz / numFrames;
			const period = 1 / hz;
			const time = i / frequency;
			const phase = (time / period) * TWO_PI;

			const sample =
				zeroSampleValue +
				waveTypeFunctions[shape](phase, dutyCycle) * amplitude;

			for (let j = 0; j < channels; j++) {
				offset = playback.writeSample(buffer, sample, offset);
			}
		}

		playback.enqueue(buffer);
		playback.play();
	},
};
