export interface Metadata {
	versions: {
		metadata: number;
		game: string;
		pack: string;
	};
	name: string;
	description: string;
	author: string;
	license: string;
	links: Record<string, string>;
	permissions: {
		network: boolean;
		fileSystem: boolean;
	};
	requires: {
		packs: string[];
		cards: string[];
		classes: string[];
		// TODO: Add tribes, etc...
	};
}

export enum PackValidationResult {
	Success = "Success",
	NoPack = "NoPack",
	InvalidGameVersion = "InvalidGameVersion",
}
