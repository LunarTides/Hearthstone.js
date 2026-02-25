import {
	createPrompt,
	isBackspaceKey,
	isDownKey,
	isEnterKey,
	isTabKey,
	isUpKey,
	makeTheme,
	type Status,
	type Theme,
	useEffect,
	useKeypress,
	usePrefix,
	useState,
} from "@inquirer/core";
import type { PartialDeep } from "@inquirer/type";

type InputTheme = {
	validationFailureMode: "keep" | "clear";
};

const inputTheme: InputTheme = {
	validationFailureMode: "keep",
};

export type InputConfig = {
	message: string;
	default?: string;
	prefill?: "tab" | "editable";
	required?: boolean;
	transformer?: (value: string, { isFinal }: { isFinal: boolean }) => string;
	validate?: (value: string) => boolean | string | Promise<string | boolean>;
	theme?: PartialDeep<Theme<InputTheme>>;
	pattern?: RegExp;
	patternError?: string;
};

const history: string[] = [];

// TODO: Stop pasting a deckcode killing the user's ears.
export default createPrompt<string, InputConfig>((config, done) => {
	const { prefill = "tab" } = config;
	const theme = makeTheme<InputTheme>(inputTheme, config.theme);
	const [status, setStatus] = useState<Status>("idle");
	// Coerce to string to handle runtime values that may be numbers despite TypeScript types
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
	const [defaultValue, setDefaultValue] = useState<string>(
		String(config.default ?? ""),
	);
	const [errorMsg, setError] = useState<string>();
	const [value, setValue] = useState<string>("");
	const [historyIndex, setHistoryIndex] = useState(-1);

	const prefix = usePrefix({ status, theme });

	async function validate(value: string): Promise<true | string> {
		const { required, pattern, patternError = "Invalid input" } = config;
		if (required && !value) {
			return "You must provide a value";
		}

		if (pattern && !pattern.test(value)) {
			return patternError;
		}

		if (typeof config.validate === "function") {
			return (await config.validate(value)) || "You must provide a valid value";
		}

		return true;
	}

	useKeypress(async (key, rl) => {
		// Ignore keypress while our prompt is doing other processing.
		if (status !== "idle") {
			return;
		}

		if (isEnterKey(key)) {
			const answer = value || defaultValue;
			setStatus("loading");

			const isValid = await validate(answer);
			if (isValid === true) {
				game.functions.audio.playSFX("input.enter");

				setValue(answer);
				setStatus("done");
				done(answer);

				if (answer && history.at(-1) !== answer) {
					history.push(answer);
				}
			} else {
				game.functions.audio.playSFX("error");

				if (theme.validationFailureMode === "clear") {
					setValue("");
				} else {
					// Reset the readline line value to the previous value. On line event, the value
					// get cleared, forcing the user to re-enter the value instead of fixing it.
					rl.write(value);
				}
				setError(isValid);
				setStatus("idle");
			}
		} else if (isBackspaceKey(key)) {
			game.functions.audio.playSFX("input.backspace");
			setValue(rl.line);

			if (!value) {
				setDefaultValue("");
			}
		} else if (isTabKey(key) && !value) {
			if (defaultValue) {
				game.functions.audio.playSFX("input.tab");
			} else {
				game.functions.audio.playSFX("input.type");
			}

			setDefaultValue("");
			rl.clearLine(0); // Remove the tab character.
			rl.write(defaultValue);
			setValue(defaultValue);
		} else if (isUpKey(key)) {
			game.functions.audio.playSFX("input.arrow.up");

			if (historyIndex === -1) {
				// NOTE: Subtract 2 for some reason.
				setHistoryIndex(history.length - 2);
			} else {
				setHistoryIndex(historyIndex - 1);
			}

			const entry = history.at(historyIndex);

			// Remove the existing line.
			rl.clearLine(0);

			rl.write(entry ?? "");
			setValue(entry ?? "");
			setError(undefined);
		} else if (isDownKey(key)) {
			game.functions.audio.playSFX("input.arrow.down");

			if (historyIndex !== -1) {
				setHistoryIndex(historyIndex + 1);
			}

			const entry = history.at(historyIndex);

			// Remove the existing line.
			rl.clearLine(0);

			rl.write(entry ?? "");
			setValue(entry ?? "");
			setError(undefined);
		} else {
			game.functions.audio.playSFX("input.type");

			setValue(rl.line);
			setError(undefined);
		}
	});

	// If prefill is set to 'editable' cut out the default value and paste into current state and the user's cli buffer
	// They can edit the value immediately instead of needing to press 'tab'
	useEffect((rl) => {
		if (prefill === "editable" && defaultValue) {
			rl.write(defaultValue);
			setValue(defaultValue);
		}
	}, []);

	// Remove trailing spaces.
	if (config.message.endsWith(" ")) {
		config.message = config.message.slice(0, -1);
	}

	const message = theme.style.message(config.message, status);
	let formattedValue = value;
	if (typeof config.transformer === "function") {
		formattedValue = config.transformer(value, { isFinal: status === "done" });
	} else if (status === "done") {
		formattedValue = theme.style.answer(value);
	}

	let defaultStr: string | undefined;
	if (defaultValue && status !== "done" && !value) {
		defaultStr = theme.style.defaultAnswer(defaultValue);
	}

	let error = "";
	if (errorMsg) {
		error = theme.style.error(errorMsg);
	}

	return [
		[prefix, message, defaultStr, formattedValue]
			.filter((v) => v !== undefined)
			.join(" "),
		error,
	];
});
