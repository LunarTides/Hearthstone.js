import * as table from "$lib/db/schema";
import { inArray, eq, like } from "drizzle-orm";
import { db } from ".";

export async function getSetting(key: string) {
	const setting = await db
		.select({ value: table.setting.value })
		.from(table.setting)
		.where(eq(table.setting.key, key))
		.limit(1);
	if (setting.length <= 0) {
		return undefined;
	}

	return setting[0].value;
}

export async function getSettings<K extends string>(keys: K[]): Promise<Record<K, any>> {
	const setting = await db.select().from(table.setting).where(inArray(table.setting.key, keys));
	if (setting.length <= 0) {
		return {} as any;
	}

	return setting.map((s) => ({ [s.key]: s.value })) as any;
}

export async function getCategorySettings<C extends string, K extends string>(
	keys: Record<C, K[]>,
): Promise<Record<C, Record<K, any>>> {
	const category = Object.keys(keys)[0];

	const setting = await db
		.select()
		.from(table.setting)
		.where(like(table.setting.key, `${category}%`));
	if (setting.length <= 0) {
		return {} as any;
	}

	return {
		[category]: Object.assign(
			{},
			...setting.map((s) => ({ [s.key.split(".").slice(1).join(".")]: s.value })),
		),
	} as any;
}

export async function generateDefaultSettings() {
	// TODO: Move default values to a settings.ts file.
	await db.insert(table.setting).values([
		{
			key: "upload.maxFileSize",
			value: 100 * 1024 * 1024,
			description: "The maximum size of packs allowed in uploads.",
		},
		{
			key: "upload.maxFileAmount",
			value: 5000,
			description: "The maximum amount of files allowed in packs.",
		},
		{
			key: "upload.allowedExtensions",
			value: [".ts", ".jsonc", ".md"],
			description:
				"The file extensions allowed in packs. If a pack contains a file with with a disallowed extension, the upload will be rejected.",
		},
		{
			key: "upload.requireApproval",
			value: true,
			description: "If packs require an approval by a Moderator to be listed.",
		},
		{
			key: "api.pageSize",
			value: 10,
			description: "The amount of items per page the API returns.",
		},
	]);
}
