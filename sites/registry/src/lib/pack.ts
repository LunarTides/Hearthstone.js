import type { Pack } from "./db/schema";

export function getAllDownloads(versions: Pack[]) {
	return versions.map((v) => v.downloadCount).reduce((p, v) => p + v);
}
