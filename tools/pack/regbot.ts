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

let regbot: RegBot;

export class RegError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		Object.setPrototypeOf(this, RegError.prototype);
		this.name = "RegError";
		this.status = status;
	}
}

type RegBotOptions = typeof defaultOptions;

export class RegBot {
	#options: RegBotOptions;

	Pack = Pack;

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

		regbot = this;
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
	 * Makes a networking request using Axios. Meant to be used internally.
	 * @throws If the API returns an error response.
	 *
	 * @param config The Axios config to use. Remember to supply a method.
	 * @returns The response from Axios.
	 */
	async request(config: AxiosRequestConfig) {
		try {
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
		} catch (error) {
			if (!error.response?.data?.message) {
				throw error;
			}

			throw new RegError(error.response.data.message, error.response.status);
		}
	}

	/**
	 * Search packs using a query. Queries the API.
	 * @throws If the API returns an error response.
	 *
	 * @returns A list of packs.
	 */
	async searchPacks(query: string): Promise<FullPack[]> {
		const response = await this.request({
			url: "/search/packs",
			method: "GET",
			params: {
				q: query,
			},
		});

		return response.data.map((data: any) => new FullPack(data));
	}
}

class Pack {
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

	constructor(data: any) {
		for (const [key, value] of Object.entries(data)) {
			(this[key as keyof this] as unknown) = value;
		}
	}

	/**
	 * Return a string representation of this pack.
	 */
	display(formatOptions?: BoxenOptions) {
		let result = "";

		result += `${this.name} (${this.packVersion})\n`;
		result += `${this.ownerName}\n`;
		result += "\n";
		result += `${this.description}\n`;
		result += `(${this.license} | ${this.gameVersion})\n`;
		result += `↓${this.downloadCount}`;

		return boxen(result, { padding: 0.5, ...formatOptions });
	}

	/**
	 * Return the blob of a pack.
	 * @throws If the API returns an error response.
	 *
	 * @returns The blob, and the filename of the pack.
	 */
	async downloadBlob() {
		const response = await regbot.request({
			url: `/@${this.ownerName}/-${this.name}/v${this.packVersion}/download`,
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
	}

	/**
	 * Download this pack to a path.
	 * @throws If the API returns an error response.
	 *
	 * @param folderPath The folder to download to pack to. This is an absolute path.
	 */
	async downloadToPath(folderPath: string) {
		const downloadInfo = await this.downloadBlob();
		const bytes = await downloadInfo.data.bytes();

		await fs.writeFile(`${folderPath}/${downloadInfo.filename}`, bytes);
	}

	/**
	 * Upload this pack to the registry.
	 * @throws If the API returns an error response.
	 *
	 * @param buffer The buffer of the file of the archive to upload.
	 */
	async upload(buffer: Buffer<ArrayBufferLike>) {
		const response = await regbot.request({
			url: `/@${this.ownerName}/-${this.name}/upload`,
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			data: buffer,
		});

		return new Pack(response.data.pack);
	}
}

class FullPack extends Pack {
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

	constructor(data: any) {
		super(data);

		for (const [key, value] of Object.entries(data)) {
			(this[key as keyof this] as unknown) = value;
		}
	}

	display(formatOptions?: BoxenOptions) {
		let result = "";

		result += `${this.name} (${this.packVersion})\n`;
		result += `${this.ownerName}${this.owner.karma ? `(${this.owner.karma})` : ""}\n`;
		result += "\n";
		result += `${this.description}\n`;
		result += `(${this.license} | ${this.gameVersion})\n`;
		result += `↓${this.totalDownloadCount} 👍${this.likes.positive - this.likes.negative}`;

		return boxen(result, { padding: 0.5, ...formatOptions });
	}
}

class PackOwner {
	username: string;
	karma?: number;
}

class User extends PackOwner {
	role: string;
}

class Group extends PackOwner {}
