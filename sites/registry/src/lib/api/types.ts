export interface FileTree {
	path: string;
	type: "directory" | "file";
	children?: FileTree[];
}

export interface File {
	type: "directory" | "file";
	size: number;
	content: string;
}
