import * as hub from "hub.ts";
import * as emergence from "./emergence/hub.ts";

export async function takeover() {
	await game.prompt.createUILoop(
		{
			message: "[universe]",
			callbackBefore: async () => {
				hub.watermark();
			},
		},
		async () => [
			{
				name: "[emergence]",
				onSelect: async () => {
					await emergence.takeover();
					return true;
				},
			},
			{
				name: "[observatory]",
				disabled: true,
				onSelect: async () => {
					return true;
				},
			},
			{
				name: "[telescope]",
				disabled: true,
				onSelect: async () => {
					return true;
				},
			},
		],
	);
}
