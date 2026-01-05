import * as z from "zod";

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

export const CommentRequest = z.object({
	text: z.string(),
});
export type CommentRequest = z.infer<typeof CommentRequest>;
