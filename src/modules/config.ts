import type { GameConfig } from "@Game/types.ts";
import { format as formatDate } from "date-and-time";

export const config = {
	/**
	 * Imports the config and sets it to `game.config`.
	 *
	 * @returns Success
	 */
	async import(): Promise<boolean> {
		delete require.cache[require.resolve("../../config.ts")];
		game.config = (await import("../../config.ts")).config as GameConfig;
		return true;
	},

	/**
	 * Sets the values in `game.time.events` to be accurate.
	 */
	setupTimeEvents(currentDate: Date) {
		const m = formatDate(currentDate, "MM");
		const d = formatDate(currentDate, "DD/MM");

		game.time.events.anniversary = d === "14/02";

		// Pride
		// https://en.wikipedia.org/wiki/List_of_LGBTQ_awareness_periods
		game.time.events.pride.month = m === "06";
		game.time.events.pride.agender = d === "19/05";
		game.time.events.pride.aro = d === "05/06";
		game.time.events.pride.ace = d === "06/04";
		game.time.events.pride.bi = d === "23/09";
		game.time.events.pride.genderfluid =
			m === "10" &&
			currentDate.getUTCDay() >= 17 &&
			currentDate.getUTCDay() <= 24;
		game.time.events.pride.intersex = d === "26/10";
		game.time.events.pride.lesbian = d === "08/10";
		game.time.events.pride.enby = d === "14/07";
		game.time.events.pride.pan = d === "24/05";
		game.time.events.pride.trans = d === "31/03";
	},

	/**
	 * @returns A list of emojis that correspond to the active time-based events.
	 */
	getCurrentEventEmojis(): string[] {
		const eventEmojis = [];

		if (game.isEventActive(game.time.events.anniversary)) {
			eventEmojis.push("🎂");
		}

		// Unicode inclusion is pretty bad...
		if (
			game.isEventActive(game.time.events.pride.month) ||
			game.isEventActive(game.time.events.pride.agender) ||
			game.isEventActive(game.time.events.pride.aro) ||
			game.isEventActive(game.time.events.pride.ace) ||
			game.isEventActive(game.time.events.pride.enby) ||
			game.isEventActive(game.time.events.pride.pan) ||
			game.isEventActive(game.time.events.pride.genderfluid)
		) {
			eventEmojis.push("🏳️‍🌈");
		}
		if (game.isEventActive(game.time.events.pride.trans)) {
			eventEmojis.push("🏳️‍⚧️");
		}
		if (game.isEventActive(game.time.events.pride.bi)) {
			eventEmojis.push("⚤");
		}
		if (game.isEventActive(game.time.events.pride.intersex)) {
			eventEmojis.push("⚥");
		}
		if (game.isEventActive(game.time.events.pride.lesbian)) {
			eventEmojis.push("⚢");
		}

		return eventEmojis;
	},
};
