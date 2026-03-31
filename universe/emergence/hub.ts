import { Separator } from "@inquirer/prompts";
import * as hub from "hub.ts";
import * as create from "./create/hub.ts";
import { EMERGENCE_VERSION } from "./lib.ts";

export async function takeover() {
	await game.prompt.createUILoop(
		{
			message: `[universe/emergence] v${EMERGENCE_VERSION}`,
			callbackBefore: async () => {
				hub.watermark();
			},
		},
		async () => [
			{
				name: "create",
				callback: async () => {
					await create.takeover();
					return true;
				},
			},
			{
				name: "edit",
				disabled: true,
				callback: async () => {
					return true;
				},
			},
			{
				name: "delete",
				disabled: true,
				callback: async () => {
					return true;
				},
			},
			new Separator(),
			{
				name: "register",
				disabled: true,
				callback: async () => {
					return true;
				},
			},
			{
				name: "reload",
				disabled: true,
				callback: async () => {
					return true;
				},
			},
		],
	);
}
