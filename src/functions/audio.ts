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

export const audioFunctions = {
	setupPlayback() {
		if (game.config.audio.disable) {
			return;
		}

		this.close();

		playback = sdl.audio.openDevice({ type: "playback" });

		channels = playback.channels;
		frequency = playback.frequency;
		bytesPerSample = playback.bytesPerSample;
		minSampleValue = playback.minSampleValue;
		maxSampleValue = playback.maxSampleValue;
		zeroSampleValue = playback.zeroSampleValue;
	},

	close() {
		if (game.config.audio.disable || !playback) {
			return;
		}

		playback.close();
	},

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

	async wait(durationMs: number) {
		if (game.config.audio.disable) {
			return;
		}

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

	async playSine(hz: number, durationMs: number, volume: number = 0.3) {
		if (game.config.audio.disable) {
			return;
		}

		const range = maxSampleValue - minSampleValue;
		const amplitude = range / 2;

		const sineAmplitude = amplitude * volume;
		const sineNote = hz;
		const sinePeriod = 1 / sineNote;

		const numFrames = (durationMs / 1000) * frequency;
		const numSamples = numFrames * channels;
		const numBytes = numSamples * bytesPerSample;
		const buffer = Buffer.alloc(numBytes);

		let offset = 0;
		for (let i = 0; i < numFrames; i++) {
			const time = i / frequency;
			const angle = (time / sinePeriod) * TWO_PI;
			const sample = zeroSampleValue + Math.sin(angle) * sineAmplitude;
			for (let j = 0; j < channels; j++) {
				offset = playback.writeSample(buffer, sample, offset);
			}
		}

		playback.enqueue(buffer);
		playback.play();
	},

	async playSlidingSine(
		startHz: number,
		endHz: number,
		durationMs: number,
		volume: number = 0.3,
	) {
		if (game.config.audio.disable) {
			return;
		}

		const range = maxSampleValue - minSampleValue;
		const amplitude = range / 2;

		const sineAmplitude = amplitude * volume;
		let sineNote = startHz;

		const numFrames = (durationMs / 1000) * frequency;
		const numSamples = numFrames * channels;
		const numBytes = numSamples * bytesPerSample;
		const buffer = Buffer.alloc(numBytes);

		let offset = 0;
		for (let i = 0; i < numFrames; i++) {
			sineNote -= endHz / numFrames;
			const sinePeriod = 1 / sineNote;

			const time = i / frequency;
			const angle = (time / sinePeriod) * TWO_PI;
			const sample = zeroSampleValue + Math.sin(angle) * sineAmplitude;
			for (let j = 0; j < channels; j++) {
				offset = playback.writeSample(buffer, sample, offset);
			}
		}

		playback.enqueue(buffer);
		playback.play();
	},
};
