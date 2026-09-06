import * as hub from "../../hub.ts";
import * as lib from "./lib.ts";

export async function takeover() {
	await game.prompt.createUILoop(
		{
			message: `[universe/microscope] v${lib.MICROSCOPE_VERSION}`,
			callbackBefore: async () => {
				hub.watermark();

				console.log("Quarks & Stuff");
				console.log();
			},
		},
		async () => [
			{
				tab: {
					index: 1,
					name: "[microscope]",
				},
				items: [
					{
						name: "Check for Issues",
						onSelect: async () => {
							await lib.checkForIssues();
							console.log();
							await game.pause();
							return true;
						},
					},
				],
			},
		],
	);
}
