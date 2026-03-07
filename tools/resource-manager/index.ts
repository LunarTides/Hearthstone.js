import { createGame } from "@Game/game.ts";
import * as hub from "../../hub.ts";
import * as ccc from "./card/custom.ts";
import * as vcc from "./card/vanilla.ts";
import * as classCreator from "./class.ts";
import * as commandCreator from "./command.ts";
import * as sfxCreator from "./sfx.ts";

// FIXME: Some tools don't work when run directly.
if (import.meta.main) {
	await createGame();
}

const resourceTypes = ["Card", "Class", "Command", "SFX"];
const cardGenerators = ["Custom", "Vanilla"];

async function promptCardCardGenerator() {
	await game.prompt.createUILoop(
		{
			message: "Manage Resources > Create > Card",
			callbackBefore: async () => {
				hub.watermark();
			},
		},
		async () => [
			...cardGenerators.map((element) => ({
				name: element,
				defaultSound: false,
				callback: async (answer: number) => {
					game.audio.playSFX("ui.leaveLoop");

					const generator = cardGenerators[answer];
					switch (generator) {
						case "Custom": {
							await ccc.main({});
							break;
						}
						case "Vanilla": {
							await vcc.main();
							break;
						}
						default: {
							throw new Error("Can't handle this generator.");
						}
					}

					return true;
				},
			})),
		],
	);
}

export async function create() {
	await game.prompt.createUILoop(
		{
			message: "Manage Resources > Create",
			callbackBefore: async () => {
				hub.watermark();
			},
		},
		async () => [
			...resourceTypes.map((element) => ({
				name: element,
				defaultSound: false,
				callback: async (answer: number) => {
					const type = resourceTypes[answer];
					switch (type) {
						case "Card": {
							game.audio.playSFX("ui.delve");
							await promptCardCardGenerator();
							break;
						}
						case "Class": {
							game.audio.playSFX("ui.leaveLoop");
							await classCreator.main();
							break;
						}
						case "Command": {
							game.audio.playSFX("ui.leaveLoop");
							await commandCreator.main({});
							break;
						}
						case "SFX": {
							game.audio.playSFX("ui.leaveLoop");
							await sfxCreator.main({});
							break;
						}
						default: {
							throw new Error("Can't handle this resource type.");
						}
					}

					return true;
				},
			})),
		],
	);
}

export async function main() {
	await game.prompt.createUILoop(
		{
			message: "Manage Resources",
			callbackBefore: async () => {
				hub.watermark();
			},
		},
		async () => [
			{
				name: "Create",
				callback: async (answer: number) => {
					await create();
					return true;
				},
			},
			{
				name: "Edit",
				disabled: true,
			},
			{
				name: "Delete",
				disabled: true,
			},
		],
	);
}

if (import.meta.main) {
	await main();
}
