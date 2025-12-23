import { setting } from "$lib/db/schema";
import { inArray, eq, like } from "drizzle-orm";
import { db } from ".";

export async function getSetting(key: string) {
	const settingInDB = await db
		.select({ value: setting.value })
		.from(setting)
		.where(eq(setting.key, key))
		.limit(1);
	if (settingInDB.length <= 0) {
		return undefined;
	}

	return settingInDB[0].value;
}

export async function getSettings<K extends string>(keys: K[]): Promise<Record<K, any>> {
	const settingInDB = await db.select().from(setting).where(inArray(setting.key, keys));
	if (settingInDB.length <= 0) {
		return {} as any;
	}

	return settingInDB.map((s) => ({ [s.key]: s.value })) as any;
}

export async function getCategorySettings<C extends string, K extends string>(
	keys: Record<C, K[]>,
): Promise<Record<C, Record<K, any>>> {
	const category = Object.keys(keys)[0];

	const settingInDB = await db
		.select()
		.from(setting)
		.where(like(setting.key, `${category}%`));
	if (settingInDB.length <= 0) {
		return {} as any;
	}

	return {
		[category]: Object.assign(
			{},
			...settingInDB.map((s) => ({ [s.key.split(".").slice(1).join(".")]: s.value })),
		),
	} as any;
}

export async function generateDefaultSettings() {
	// TODO: Move default values to a settings.ts file.
	await db.insert(setting).values([
		{ key: "upload.maxFileSize", value: 100 * 1024 * 1024 },
		{ key: "upload.maxFileAmount", value: 5000 },
		{ key: "upload.allowedExtensions", value: [".ts", ".jsonc", ".md"] },
		{ key: "upload.requireApproval", value: true },
		{ key: "api.pageSize", value: 10 },
	]);
}
