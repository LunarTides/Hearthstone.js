// NOTE: This module doesn't check 'Networking > Allow > Game' before doing networking requests.
// You must do so yourself before using this module.

import fs from "node:fs/promises";
import axios, { type AxiosRequestConfig } from "axios";
import boxen, { type Options as BoxenOptions } from "boxen";

// NOTE: Update when appropriate.
const botVersion = "0.1.0";
const defaultOptions = {
	baseUrl: "https://hs.lunartides.dev/registry" as string,
	apiVersion: "latest" as "latest" | "next" | `v${number}`,
	token: "" as string,
};

type RegBotOptions = typeof defaultOptions;

export class RegBot {
	#options: RegBotOptions;

	constructor(options: Partial<RegBotOptions>) {
		// Load dotenv file.
		try {
			process.loadEnvFile("../../.env");
		} catch {}

		let token = "";
		if (process.env.REGISTRY_API_TOKEN) {
			token = process.env.REGISTRY_API_TOKEN;
		}

		this.#options = {
			...defaultOptions,
			token,
			...options,
		};
	}

	/**
	 * Update current options. Adds new options onto existing ones.
	 *
	 * @param options The new options
	 */
	useOptions(options: Partial<RegBotOptions>) {
		this.#options = {
			...this.#options,
			...options,
		};
	}

	/**
	 * @returns The current options
	 */
	getOptions() {
		return this.#options;
	}

	/**
	 * Makes a networking request using Axios.
	 *
	 * @param config The Axios config to use. Remember to supply a method.
	 * @returns The response from Axios.
	 */
	async #request(config: AxiosRequestConfig) {
		const response = await axios({
			...config,
			url: `${this.#options.baseUrl}/api/${this.#options.apiVersion}${config.url}`,
			headers: {
				...config.headers,
				"User-Agent": `RegBot/${botVersion}`,
				Authorization: this.#options.token
					? `Bearer ${this.#options.token}`
					: undefined,
			},
		});

		return response;
	}

	/**
	 * Return a string representation of the pack.
	 */
	displayPack(pack: Pack | FullPack, formatOptions?: BoxenOptions) {
		function ifFullPack(pack: Pack | FullPack): pack is FullPack {
			return Object.hasOwn(pack, "owner");
		}

		let result = "";

		result += `${pack.name} (${pack.packVersion})\n`;
		result += `${pack.ownerName}${ifFullPack(pack) && pack.owner.karma ? `(${pack.owner.karma})` : ""}\n`;
		result += "\n";
		result += `${pack.description}\n`;
		result += `(${pack.license} | ${pack.gameVersion})\n`;
		result += `↓${ifFullPack(pack) ? pack.totalDownloadCount : pack.downloadCount}${ifFullPack(pack) ? ` 👍${pack.likes.positive - pack.likes.negative}` : ""}`;

		return boxen(result, { padding: 0.5, ...formatOptions });
	}

	/**
	 * Search packs using a query. Queries the API.
	 *
	 * @returns A list of packs.
	 */
	async searchPacks(query: string) {
		try {
			const response = await this.#request({
				url: "/search/packs",
				method: "GET",
				params: {
					q: query,
				},
			});

			return response.data as FullPack[];
		} catch (error) {
			// TODO: Handle error.
			console.log(error);
			return [];
		}
	}

	/**
	 * Return the blob of a pack.
	 *
	 * @param pack The pack to download
	 * @returns The blob, and the filename of the pack.
	 */
	async downloadBlob(pack: Pack) {
		try {
			const response = await this.#request({
				url: `/@${pack.ownerName}/-${pack.name}/v${pack.packVersion}/download`,
				method: "POST",
				responseType: "arraybuffer",
				headers: {
					"Content-Type": "application/json",
				},
			});

			return {
				data: new Blob(response.data),
				filename: response.headers["content-disposition"]
					?.split('filename="')[1]
					.slice(0, -1),
			};
		} catch (error) {
			// TODO: Handle error.
			console.log(error);
			return null;
		}
	}

	/**
	 * Download a pack to a path.
	 *
	 * @param pack The pack to download
	 * @param folderPath The folder to download to pack to. This is an absolute path.
	 */
	async downloadToPath(pack: Pack, folderPath: string) {
		const downloadInfo = await this.downloadBlob(pack);
		if (!downloadInfo) {
			throw new Error("This error should never trigger.");
		}

		const bytes = await downloadInfo.data.bytes();

		await fs.writeFile(`${folderPath}/${downloadInfo.filename}`, bytes);
	}
}

interface Pack {
	id: string;
	ownerName: string;
	name: string;
	metadataVersion: number;
	gameVersion: string;
	packVersion: string;
	description: string;
	license: string;
	author: string;
	permissions: string[];
	downloadCount: number;
	unpackedSize: number;
	isLatestVersion: boolean;
	approved: boolean;
	approvedBy: string;
	approvedAt: string;
	denied: boolean;
	createdAt: string;
}

interface FullPack extends Pack {
	owner: User | Group;
	totalDownloadCount: number;
	likes: {
		positive: number;
		hasLiked: boolean;
		negative: number;
		hasDisliked: boolean;
	};
	approvedByUser: User;
	// TODO: Add comments.
}

interface User {
	username: string;
	role: string;
	karma?: number;
}

interface Group {
	username: string;
	karma?: number;
}
