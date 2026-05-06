import { styleText } from "node:util";
import { cursorHide } from "@inquirer/ansi";
import {
	createPrompt,
	isBackspaceKey,
	isDownKey,
	isEnterKey,
	isNumberKey,
	isTabKey,
	isUpKey,
	type Keybinding,
	type KeypressEvent,
	makeTheme,
	Separator,
	type Status,
	type Theme,
	useEffect,
	useKeypress,
	useMemo,
	usePagination,
	usePrefix,
	useRef,
	useState,
	ValidationError,
} from "@inquirer/core";
import figures from "@inquirer/figures";
import type { PartialDeep } from "@inquirer/type";
import { parseTags } from "chalk-tags";

type SelectTheme = {
	icon: { cursor: string };
	style: {
		disabled: (text: string) => string;
		description: (text: string) => string;
		keysHelpTip: (keys: [key: string, action: string][]) => string | undefined;
	};
	i18n: { disabledError: string };
	indexMode: "hidden" | "number";
	keybindings: ReadonlyArray<Keybinding>;
};

const selectTheme: SelectTheme = {
	icon: { cursor: figures.pointer },
	style: {
		disabled: (text: string) => styleText("dim", text),
		description: (text: string) => styleText("cyan", text),
		keysHelpTip: (keys: [string, string][]) =>
			keys
				.map(
					([key, action]) =>
						`${styleText("bold", key)} ${styleText("dim", action)}`,
				)
				.join(styleText("dim", " • ")),
	},
	i18n: { disabledError: "This option is disabled and cannot be selected." },
	indexMode: "hidden",
	keybindings: [],
};

type Choice<Value> = {
	value: Value;
	name?: string;
	description?: string;
	short?: string;
	disabled?: boolean | string;
	type?: never;
	tab?: number;
};

type NormalizedChoice<Value> = {
	value: Value;
	name: string;
	description?: string;
	short: string;
	disabled: boolean | string;
};

type SelectConfig<Value> = {
	message: string;
	choices: {
		tab: {
			index: number;
			name?: string;
		};
		items: ReadonlyArray<Value | Choice<Value> | Separator>;
	}[];
	pageSize?: number;
	loop?: boolean;
	default?: NoInfer<Value>;
	theme?: PartialDeep<Theme<SelectTheme>>;
};

function isSelectable<Value>(
	item: NormalizedChoice<Value> | Separator,
): item is NormalizedChoice<Value> {
	return !Separator.isSeparator(item) && !item.disabled;
}

function isNavigable<Value>(
	item: NormalizedChoice<Value> | Separator,
): item is NormalizedChoice<Value> {
	return !Separator.isSeparator(item);
}

function isRawValue<Value>(value: any): value is Value {
	return typeof value !== "object" || value === null || !("value" in value);
}

function normalizeChoices<Value>(
	choices: ReadonlyArray<Value | Choice<Value> | Separator>,
): Array<NormalizedChoice<Value> | Separator> {
	return choices.map((choice) => {
		if (Separator.isSeparator(choice)) return choice;

		if (isRawValue<Value>(choice)) {
			// It's a raw value (string, number, etc.)
			const name = String(choice);
			return {
				value: choice,
				name,
				short: name,
				disabled: false,
			};
		}

		const name = choice.name ?? String(choice.value);
		const normalizedChoice: NormalizedChoice<Value> = {
			value: choice.value,
			name,
			short: choice.short ?? name,
			disabled: choice.disabled ?? false,
		};

		if (choice.description) {
			normalizedChoice.description = choice.description;
		}

		return normalizedChoice;
	});
}

// These functions aren't included in core, so I use copy-pasted the `isUpKey` and `isDownKey` functions.
export const isRightKey = (
	key: KeypressEvent,
	keybindings: ReadonlyArray<Keybinding> = [],
): boolean =>
	// The right key
	key.name === "right" ||
	// Vim keybinding: hjkl keys map to left/down/up/right
	(keybindings.includes("vim") && key.name === "l") ||
	// Emacs keybinding: Ctrl+F means "forward" in Emacs navigation conventions
	(keybindings.includes("emacs") && key.ctrl && key.name === "f");

export const isLeftKey = (
	key: KeypressEvent,
	keybindings: ReadonlyArray<Keybinding> = [],
): boolean =>
	// The down key
	key.name === "left" ||
	// Vim keybinding: hjkl keys map to left/down/up/right
	(keybindings.includes("vim") && key.name === "h") ||
	// Emacs keybinding: Ctrl+B means "backward" in Emacs navigation conventions
	(keybindings.includes("emacs") && key.ctrl && key.name === "b");

export default createPrompt(
	<const Value>(config: SelectConfig<Value>, done: (value: Value) => void) => {
		const { loop = true, pageSize = 7 } = config;
		const theme = makeTheme<SelectTheme>(selectTheme, config.theme);
		const { keybindings } = theme;
		const [status, setStatus] = useState<Status>("idle");
		const [tab, setTab] = useState<number>(0);
		const prefix = usePrefix({ status, theme });
		const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

		// Vim keybindings (j/k) conflict with typing those letters in search,
		// so search must be disabled when vim bindings are enabled
		const searchEnabled = !keybindings.includes("vim");

		// NOTE: For debugging. Places a third tab.
		config.choices.push({
			tab: {
				index: 3,
				name: "Other",
			},
			items: [
				config.choices[0].items[0],
				new Separator(),
				{
					value: "Test" as any,
					disabled: true,
				},
			],
		});

		// Get the highest tab count from the items.
		const maxTab = useMemo(
			() =>
				config.choices.reduce((prev, item) => {
					if (item.tab.index > prev) {
						return item.tab.index;
					}

					return prev;
				}, 0) - 1,
			[config.choices],
		);

		let items = normalizeChoices(
			config.choices.find((t) => t.tab.index - 1 === tab)?.items ?? [],
		);

		if (items.filter((item) => !Separator.isSeparator(item)).length <= 0) {
			items = normalizeChoices([
				{
					value: undefined as Value,
					name: "Empty",
					short: "Empty",
					description: "There are no items on this tab.",
					disabled: true,
				},
			]);
		}

		const bounds = useMemo(() => {
			const first = items.findIndex(isNavigable);
			const last = items.findLastIndex(isNavigable);

			if (first === -1) {
				throw new ValidationError(
					"[select prompt] No selectable choices. All choices are disabled.",
				);
			}

			return { first, last };
		}, [items]);

		const defaultItemIndex = useMemo(() => {
			if (!("default" in config)) return -1;
			return items.findIndex(
				(item) => isSelectable(item) && item.value === config.default,
			);
		}, [config.default, items]);

		const [active, setActive] = useState(
			defaultItemIndex === -1 ? bounds.first : defaultItemIndex,
		);

		const selectedChoice = items[active];
		if (selectedChoice == null || Separator.isSeparator(selectedChoice)) {
			throw new Error("Active index does not point to a choice");
		}

		const [errorMsg, setError] = useState<string>();

		useKeypress((key, rl) => {
			clearTimeout(searchTimeoutRef.current);
			if (errorMsg) {
				setError(undefined);
			}

			const isUp = isUpKey(key, keybindings);
			const isDown = isDownKey(key, keybindings);
			const isRight = isRightKey(key, keybindings);
			const isLeft = isLeftKey(key, keybindings);
			const isTab = isTabKey(key);

			if (isEnterKey(key)) {
				if (selectedChoice.disabled) {
					game.audio.playSFX("error");
					setError(theme.i18n.disabledError);
				} else {
					setStatus("done");
					done(selectedChoice.value);
				}
			} else if (isUp || isDown) {
				rl.clearLine(0);
				if (
					loop ||
					(isUp && active !== bounds.first) ||
					(isDown && active !== bounds.last)
				) {
					if (isUp) {
						game.audio.playSFX("input.select.arrow.up");
					} else if (isDown) {
						game.audio.playSFX("input.select.arrow.down");
					}

					const offset = isUp ? -1 : 1;
					let next = active;
					do {
						next = (next + offset + items.length) % items.length;
					} while (!isNavigable(items[next]!));
					setActive(next);
				} else {
					// Hit boundary.
					game.audio.playSFX("input.select.hit_boundary");
				}
			} else if (isRight || isLeft || isTab) {
				const oldTab = tab;
				let newTab = tab;

				if (isRight || (isTab && !key.shift)) {
					newTab++;

					if (newTab > maxTab) {
						// Reached right boundary.
						newTab = 0;
					}
				} else if (isLeft || (isTab && key.shift)) {
					newTab--;

					if (tab <= 0) {
						// Reached left boundary.
						newTab = maxTab;
					}
				}

				if (oldTab !== newTab) {
					game.audio.playSFX("input.select.tab.switch");
					setActive(bounds.first);
				} else {
					game.audio.playSFX("input.select.hit_boundary");
				}

				setTab(newTab);
			} else if (isNumberKey(key) && key.shift) {
				// FIXME: This no workie!!!!
				const newTab = Number(rl.line) - 1;

				if (newTab >= 0 && newTab <= maxTab) {
					game.audio.playSFX("input.select.tab.switch");
					setTab(newTab);
				} else {
					// TODO: Maybe add a less obstructive `input.error`.
					game.audio.playSFX("error");
				}

				// add timeout when we have 10 or more items.
				// this is so the user has time to type multiple numbers.
				const timeout = maxTab < 10 ? 0 : 700;

				searchTimeoutRef.current = setTimeout(() => {
					rl.clearLine(0);
				}, timeout);
			} else if (isNumberKey(key) && !Number.isNaN(Number(rl.line))) {
				const selectedIndex = Number(rl.line) - 1;

				// Find the nth item (ignoring separators)
				let selectableIndex = -1;
				const position = items.findIndex((item) => {
					if (Separator.isSeparator(item)) return false;

					selectableIndex++;
					return selectableIndex === selectedIndex;
				});

				const item = items[position];
				if (item != null && isSelectable(item)) {
					game.audio.playSFX("input.select.number_key");
					setActive(position);
				}

				// add timeout when we have 10 or more items.
				// this is so the user has time to type multiple numbers.
				const timeout = items.length < 10 ? 0 : 700;

				searchTimeoutRef.current = setTimeout(() => {
					rl.clearLine(0);
				}, timeout);
			} else if (isBackspaceKey(key)) {
				game.audio.playSFX("input.backspace");
				rl.clearLine(0);
			} else if (searchEnabled) {
				game.audio.playSFX("input.type");

				const searchTerm = rl.line.toLowerCase();
				const matchIndex = items.findIndex((item) => {
					if (Separator.isSeparator(item) || !isSelectable(item)) return false;

					return item.name.toLowerCase().startsWith(searchTerm);
				});

				if (matchIndex !== -1) {
					setActive(matchIndex);
				}

				searchTimeoutRef.current = setTimeout(() => {
					rl.clearLine(0);
				}, 700);
			}
		});

		useEffect(
			() => () => {
				clearTimeout(searchTimeoutRef.current);
			},
			[],
		);

		const message = theme.style.message(config.message, status);

		// If there are more than 1 tabs, show a little tab switcher thingy right above the help line.
		let tabLine = "";
		if (maxTab > 1) {
			for (let i = 0; i <= maxTab; i++) {
				const tabInfo = config.choices.find(
					(choice) => choice.tab.index - 1 === i,
				)?.tab;
				const name = tabInfo?.name ?? i + 1;

				if (i === tab) {
					tabLine += parseTags(`<black bg:white>${name}</> `);
					continue;
				}

				tabLine += `${name} `;
			}
		}

		const helpLine = theme.style.keysHelpTip([
			["↑↓", "navigate"],
			["→←", "switch tabs"],
			["⏎", "select"],
		]);

		let separatorCount = 0;
		const page = usePagination({
			items,
			active,
			renderItem({ item, isActive, index }) {
				if (Separator.isSeparator(item)) {
					separatorCount++;
					return ` ${item.separator}`;
				}

				const cursor = isActive ? theme.icon.cursor : " ";
				const indexLabel =
					theme.indexMode === "number" ? `${index + 1 - separatorCount}. ` : "";

				if (item.disabled) {
					const disabledLabel =
						typeof item.disabled === "string" ? item.disabled : "(disabled)";
					const disabledCursor = isActive ? theme.icon.cursor : "-";
					return theme.style.disabled(
						`${disabledCursor} ${indexLabel}${item.name} ${disabledLabel}`,
					);
				}

				const color = isActive ? theme.style.highlight : (x: string) => x;
				return color(`${cursor} ${indexLabel}${item.name}`);
			},
			pageSize,
			loop,
		});

		if (status === "done") {
			return [prefix, message, theme.style.answer(selectedChoice.short)]
				.filter(Boolean)
				.join(" ");
		}

		const { description } = selectedChoice;
		const lines = [
			[prefix, message].filter(Boolean).join(" "),
			page,
			" ",
			description ? theme.style.description(description) : "",
			errorMsg ? theme.style.error(errorMsg) : "",
			tabLine && (description || errorMsg) && tabLine ? " " : "", // If there is a description / error message and tab switcher, add a space between them.
			tabLine,
			helpLine,
		]
			.filter(Boolean)
			.join("\n")
			.trimEnd();

		return `${lines}${cursorHide}`;
	},
);

export { Separator } from "@inquirer/core";
