import type { Metadata } from "@Game/types/pack.ts";
import { confirm, Separator } from "@inquirer/prompts";
import { semver } from "bun";
import { parseTags } from "chalk-tags";
import * as hub from "hub.ts";
import {
	compressPack,
	exportPack,
	extractPack,
	getPacks,
	getPermissions,
	importPack,
} from "./packager.ts";
import {
	getAPITokensFromEnv,
	type RegBot,
	saveAPITokensToDotEnv,
} from "./regbot.ts";

// This will be set to true after changing a metadata configuration value.
let dirty = false;

export async function promptImportPack() {
	let packs = await getPacks();

	await hub.createUILoop(
		{
			message: "Import a Pack",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			dynamicChoices: true,
			callbackBefore: async () => {
				hub.watermark(false);

				console.log(
					"Download a pack, then drag the extracted folder into '/packs/vacuum/'.\n",
				);

				packs = await getPacks();
			},
		},
		async () => [
			...packs.map((p) => ({
				name: `@${p.ownerName}/${p.name}`,
				callback: async (answer: number) => {
					const pack = packs[answer];
					const success = await importPack(pack);
					if (success) {
						game.audio.playSFX("ui.action1");
					}

					return true;
				},
			})),
			new Separator(),
			{
				name: "Refresh",
			},
		],
	);
}

export async function promptEditPack() {
	let packs = await getPacks();

	await hub.createUILoop(
		{
			message: "Create / Edit",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			dynamicChoices: true,
			callbackBefore: async () => {
				hub.watermark(false);
				dirty = false;

				packs = await getPacks();
			},
		},
		async () => [
			...packs.map((p) => ({
				name: `@${p.ownerName}/${p.name}`,
				callback: async (answer: number) => {
					const pack = packs.at(answer);
					await exportPack(pack);

					return true;
				},
			})),
			{
				name: "New",
				callback: async () => {
					await exportPack();

					return true;
				},
			},
			new Separator(),
			{
				name: "Refresh",
			},
		],
	);
}

export async function promptCompressPack() {
	let packs = await getPacks();

	await hub.createUILoop(
		{
			message: "Compress / Extract",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			dynamicChoices: true,
			callbackBefore: async () => {
				hub.watermark(false);
				console.log("The pack are stored in the '/packs/vacuum/' folder.");
				console.log("Compressed packs have the extension '.tar.gz'.");
				console.log(
					"<red>Red</red> = Compressed, <green>Green</green> = Extracted",
				);
				console.log();

				dirty = false;
				packs = await getPacks();
			},
		},
		async () => [
			...packs.map((p) => ({
				name: parseTags(
					p.path.endsWith(".tar.gz")
						? `<red>@${p.ownerName}/${p.name}</red>`
						: `<green>@${p.ownerName}/${p.name}</green>`,
				),
				defaultAudio: false,
				callback: async (answer: number) => {
					const pack = packs.at(answer);
					if (!pack) {
						return true;
					}

					game.audio.playSFX("ui.action1");

					if (p.path.endsWith(".tar.gz")) {
						await extractPack(pack.path);
					} else {
						await compressPack(pack.path);
					}
					return true;
				},
			})),
			new Separator(),
			{
				name: "Refresh",
			},
		],
	);
}

export async function configureMetadata(metadata: Metadata) {
	let success = true;

	await hub.createUILoop(
		{
			message: "Configure Metadata",
			backButtonText: "Done",
			seperatorBeforeBackButton: false,
			callbackBefore: async () => {
				hub.watermark(false);
				console.log(Bun.JSON5.stringify(metadata, null, 4));
				console.log();
			},
		},
		async () => [
			{
				name: "Version",
				description: "The version of the pack. Uses semver.",
				callback: async () => {
					// TODO: Use `game.input` instead.
					metadata.versions.pack = await game.input({
						message: "Set the version of the pack.",
						default: metadata.versions.pack,
						validate: (value) => semver.satisfies(value, ">0.0.0"),
					});

					dirty = true;
					return true;
				},
			},
			{
				name: "Name",
				description:
					"The name of the pack. This must be unique for the author.",
				callback: async () => {
					metadata.name = await game.input({
						message: "Set the name of the pack. This must be unique.",
						default: metadata.name,
					});

					dirty = true;
					return true;
				},
			},
			{
				name: "Description",
				description: "The description of the pack.",
				callback: async () => {
					metadata.description = await game.input({
						message: "Set the description of the pack.",
						default: metadata.description,
					});

					dirty = true;
					return true;
				},
			},
			{
				name: "Author",
				description:
					"The author of the pack. Can be a username or a group name. Must be set when uploading to a registry.",
				callback: async () => {
					metadata.author = await game.input({
						message: "Author.",
						default: metadata.author,
					});

					dirty = true;
					return true;
				},
			},
			{
				name: "License",
				description:
					"The license that the pack is under. For example, 'GPL-3.0', 'MIT', 'Apache-2.0', etc...",
				callback: async () => {
					const select = async (answer: number) => {
						const license = licenses[answer];
						if (license instanceof Separator) {
							// Shouldn't be possible.
							throw TypeError("Chose a seperator");
						}

						metadata.license = license.name;
						return false;
					};

					const licenses = [
						{
							name: "Proprietary",
							description:
								"Complete copyright. Others can't use this pack. You cannot upload this pack to the registry.",
							callback: select,
						},
						new Separator(),
						{
							name: "GPL-2.0",
							description: "GNU General Public License Version 2.0",
							callback: select,
						},
						{
							name: "GPL-3.0",
							description: "GNU General Public License Version 3.0",
							callback: select,
						},
						{
							name: "AGPL-3.0",
							description: "GNU Affero General Public License Version 3.0",
							callback: select,
						},
						{
							name: "MIT",
							description: "MIT License",
							callback: select,
						},
						{
							name: "Apache-2.0",
							description: "Apache License Version 2.0",
							callback: select,
						},
						new Separator(),
						{
							name: "Other",
							description: "Specify another license.",
							callback: async () => {
								metadata.license = await game.input({ message: "License." });
								dirty = true;

								return false;
							},
						},
					];

					const existingLicense = licenses.find(
						(l) => !(l instanceof Separator) && l.name === metadata.license,
					);
					const otherOption = licenses.find(
						(l) => !(l instanceof Separator) && l.name === "Other",
					);

					await game.prompt.createUILoop(
						{
							message: "Set the license of the pack.",
							backButtonText: "",
							seperatorBeforeBackButton: false,
							// If the license exists, choose it by default. Otherwise choose "Other".
							default: existingLicense
								? licenses.indexOf(existingLicense)
								: otherOption
									? licenses.indexOf(otherOption)
									: undefined,
						},
						async () => licenses,
					);

					return true;
				},
			},
			{
				name: "Links",
				description:
					"Any links. These links can lead anywhere. Don't link to any dangerous websites.",
				callback: async () => {
					const changed = await game.prompt.configureObject(
						metadata.links,
						true,
						async () => hub.watermark(false),
					);

					// NOTE: I can't do `dirty ||= await game.prompt...` since if dirty is true, it won't evaluate the right side of the expression.
					// Learned that the hard way...
					dirty ||= changed;
					return true;
				},
			},
			{
				name: "Permissions",
				description:
					"Resources that the pack needs to function. Check this out before exporting.",
				callback: async () => {
					const changed = await game.prompt.configureObject(
						metadata.permissions,
						false,
						async () => hub.watermark(false),
					);

					dirty ||= changed;
					return true;
				},
			},
			{
				name: "Requires",
				description: "Pack dependencies.",
				callback: async () => {
					// TODO: Capitalize the choices.
					const changed = await game.prompt.configureObject(
						metadata.requires,
						false,
						async () => hub.watermark(false),
					);

					dirty ||= changed;
					return true;
				},
			},
			new Separator(),
			{
				name: "Cancel",
				description: "Cancel changes to the metadata.",
				defaultSound: false,
				callback: async () => {
					if (!dirty) {
						// No changes have been made.
						game.audio.playSFX("ui.back");
						success = false;
						return false;
					}

					game.audio.playSFX("ui.delve");

					const done = await confirm({
						message:
							"Are you sure you want to cancel configuring the metadata? Your changes will be lost.",
						default: false,
					});

					if (done) {
						game.audio.playSFX("ui.back");
						success = false;
						return false;
					}

					return true;
				},
			},
			{
				name: "Done",
				description: "Done configuring the metadata.",
				callback: async () => {
					if (metadata.license === "Proprietary") {
						const licenseConfirm = await confirm({
							message: parseTags(
								"<yellow>You haven't changed the license.\nOthers are not allowed to use this pack without a proper open-source license.\nThink about changing the license to 'GPL-3', 'MIT', 'Apache-2.0', etc...\nContinue anyway?</yellow>",
							),
							default: false,
						});

						if (!licenseConfirm) {
							return true;
						}
					}

					if (!Object.values(metadata.permissions).some(Boolean)) {
						const permissionsConfirm = await confirm({
							message: parseTags(
								`<yellow>You haven't set any permissions. <bold>Are you sure your pack doesn't require any of the following permissions: ${getPermissions(metadata, false).join(", ")}?</bold></yellow>`,
							),
							default: false,
						});

						if (!permissionsConfirm) {
							return true;
						}
					}

					// TODO: Wrap for sfx.
					const done = await confirm({
						message: "Are you sure you are done configuring the metadata?",
						default: false,
					});

					if (done) {
						game.audio.playSFX("ui.back");
						return false;
					}

					return true;
				},
			},
		],
	);

	return success;
}

export async function requireAPIToken(regbot: RegBot) {
	let currentToken: string | undefined;
	try {
		({ currentToken } = await getAPITokensFromEnv());
	} catch {}

	if (currentToken) {
		regbot.useOptions({ token: currentToken });
		return true;
	}

	if (regbot.getOptions().token) {
		return true;
	}

	console.log("<yellow>This requires an API token to use.</yellow>");
	console.log();
	console.log("<b>How to obtain a token.</b>");
	console.log("1. Go to your profile in the registry, and click 'Settings'.");
	console.log(
		"2. Under 'Authentication', you should find the 'Gradual Tokens' section.",
	);
	console.log(
		"3. Create a new token here. Remember to give it a unique name to remember it.",
	);
	console.log("4. Give it the scope 'packs.upload' at minimum.");
	console.log(
		"5. After creation, you will see the token. You <i>cannot</i> see the token again after this point.",
	);
	console.log(
		"6. Click enter, then go to 'API Tokens'. Select 'New', then type in the required details.",
	);
	console.log();

	await game.pause();
	return false;
}

export const registry = {
	prompt: async (regbot: RegBot) => {
		// Ensure networking permissions
		if (!game.config.networking.allow.game) {
			console.error(
				"<red>Networking access denied. Please enable 'Networking > Allow > Game' to continue. Aborting.</red>\n",
			);
			await game.pause();
			return;
		}

		await hub.createUILoop(
			{
				message: "Registry Options",
			},
			async () => [
				{
					name: "Download",
					callback: async () => {
						await registry.download.prompt(regbot);
						return true;
					},
				},
				{
					name: "Upload",
					callback: async () => {
						await registry.upload.prompt(regbot);
						return true;
					},
				},
				new Separator(),
				{
					name: "API Tokens",
					callback: async () => {
						await registry.apiTokens(regbot);
						return true;
					},
				},
			],
		);
	},

	apiTokens: async (regbot: RegBot) => {
		let tokens: Dict<string> = {};
		let currentToken: string | undefined;

		try {
			({ tokens, currentToken } = await getAPITokensFromEnv());
		} catch {
			// No saved tokens, that's fine.
		}

		await hub.createUILoop(
			{
				message: "Registry Options > API Tokens",
				seperatorBeforeBackButton: false,
				dynamicChoices: true,
				default: async () =>
					currentToken ? Object.values(tokens).indexOf(currentToken) : 0,
				callbackBefore: async () => {
					hub.watermark(false);
					dirty = false;

					try {
						({ tokens, currentToken } = await getAPITokensFromEnv());
					} catch {
						// No saved tokens, that's fine.
					}
				},
			},
			async () => [
				...Object.entries(tokens).map(([key, value]) => ({
					name: value === currentToken ? `<green>${key}</green>` : key,
					callback: async (answer: number) => {
						regbot.useOptions({ token: value });
						await saveAPITokensToDotEnv(tokens, key);
						return true;
					},
				})),
				{
					name: "New",
					callback: async () => {
						const name = await game.input({
							message: "Name (can be anything): ",
						});
						if (!name) {
							return true;
						}

						const token = await game.input({
							message: "Token: ",
						});
						if (!token) {
							return true;
						}

						tokens[name] = token;
						await saveAPITokensToDotEnv(tokens, name);

						regbot.useOptions({ token });
						return true;
					},
				},
				new Separator(),
				{
					name: "Refresh",
				},
			],
		);
	},

	download: {
		prompt: async (regbot: RegBot) => {
			await hub.createUILoop(
				{
					message: "Registry Options > Download",
				},
				async () => [
					{
						name: "Pack",
						callback: async () => {
							await registry.download.pack(regbot);
							return true;
						},
					},
					{
						name: "Card (WIP)",
						disabled: true,
					},
				],
			);
		},

		pack: async (regbot: RegBot) => {
			hub.watermark(true);
			console.log("<cyan>?</cyan> <b>Registry Options > Download > Pack</b>");

			// Ask for search query
			const query = await game.input({
				message: "Search query:",
			});

			// Search & Display packs
			console.log("Searching...");

			let packs: Awaited<ReturnType<typeof regbot.searchPacks>>;
			try {
				packs = await regbot.searchPacks(query);
			} catch (error) {
				game.audio.playSFX("error");

				console.log(`<red>ERROR: ${error.message} (${error.status})`);
				console.log();
				await game.pause();

				return;
			}

			for (const pack of packs) {
				console.log(pack.display());
			}

			console.log();

			// Prompt the user to select a pack to download
			await hub.createUILoop(
				{
					message: "Registry Options > Download > Pack",
				},
				async () => [
					...packs.map((pack) => ({
						name: `@${pack.ownerName}/${pack.name}`,
						description: pack.display(),
						callback: async (answer: number) => {
							const pack = packs[answer];

							// TODO: Allow selecting the version to download.

							// Download the pack to the 'packs' folder
							// TODO: Add progress bar.
							console.log("Downloading...");
							try {
								await pack.downloadToPath(
									game.fs.restrictPath("/packs/vacuum"),
								);
							} catch (error) {
								game.audio.playSFX("error");

								console.log(`<red>ERROR: ${error.message} (${error.status})`);
								console.log();
								await game.pause();

								return true;
							}

							const packsInFolder = await getPacks();
							const packInFolder = packsInFolder.find(
								(p) => p.ownerName === pack.ownerName && p.name === pack.name,
							);
							if (!packInFolder) {
								throw new Error("Pack not downloaded successfully.");
							}

							// Prompt the user to import a pack
							const success = await importPack(packInFolder, {
								forceDelete: true,
							});
							if (success) {
								game.audio.playSFX("ui.action1");
								console.log(
									"<green>Pack downloaded & imported successfully!</green>",
								);
								await game.pause();
							}

							return true;
						},
					})),
				],
			);
		},
	},

	upload: {
		prompt: async (regbot: RegBot) => {
			hub.watermark(false);
			console.log("<cyan>?</cyan> <b>Registry Options > Upload</b>");

			if (!(await requireAPIToken(regbot))) {
				return;
			}

			let packs = await getPacks();
			for (const pack of packs) {
				await compressPack(pack.path);
			}

			await hub.createUILoop(
				{
					message: "Upload a Pack",
					backButtonText: "Done",
					seperatorBeforeBackButton: false,
					dynamicChoices: true,
					callbackBefore: async () => {
						hub.watermark(false);
						console.log("<cyan>?</cyan> <b>Registry Options > Upload</b>");

						packs = await getPacks();
					},
				},
				async () => [
					...packs.map((p) => ({
						name: `@${p.ownerName}/${p.name}`,
						callback: async (answer: number) => {
							const packInfo = packs[answer];
							const pack = new regbot.Pack(packInfo);

							console.log("Uploading...");
							try {
								const uploadedPack = await pack.upload(packInfo.bytes);
								game.audio.playSFX("ui.action1");

								console.log(uploadedPack.display());
								console.log(
									"<green>The pack was uploaded successfully!</green>",
								);
							} catch (error) {
								game.audio.playSFX("error");
								console.log(`<red>ERROR: ${error.message} (${error.status})`);

								if (error.message === "Please log in.") {
									console.log(
										`<yellow>HINT: The token is invalid. Has it been deleted?</yellow>`,
									);
								} else if (
									error.message ===
									"This request is outside the scope of this token."
								) {
									console.log(
										`<yellow>HINT: Have you already uploaded a different version of this pack? If so, make sure your token has the 'packs.-${pack.name}.upload' scope.</yellow>`,
									);
								}
							}

							console.log();
							await game.pause();
							return true;
						},
					})),
					new Separator(),
					{
						name: "Refresh",
					},
				],
			);
		},
	},
};

export async function main(regbot: RegBot) {
	await hub.createUILoop(
		{
			message: "Pack Options",
			backButtonText: import.meta.main ? "Exit" : "Back",
		},
		async () => [
			{
				name: "Create / Edit",
				callback: async () => {
					await promptEditPack();
					return true;
				},
			},
			{
				name: "Import Locally",
				callback: async () => {
					await promptImportPack();
					return true;
				},
			},
			{
				name: "Compress / Extract",
				callback: async () => {
					await promptCompressPack();
					return true;
				},
			},
			new Separator(),
			{
				name: "Registry",
				callback: async () => {
					await registry.prompt(regbot);
					return true;
				},
			},
		],
	);
}
