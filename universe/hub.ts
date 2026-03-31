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
				callback: async () => {
					await emergence.takeover();
					return true;
				},
			},
			{
				name: "[observatory]",
				disabled: true,
				callback: async () => {
					return true;
				},
			},
			{
				name: "[telescope]",
				disabled: true,
				callback: async () => {
					return true;
				},
			},
		],
	);
}
