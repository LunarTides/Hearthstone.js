export interface FileTree {
	path: string;
	type: "directory" | "file";
	children?: FileTree[];
}
