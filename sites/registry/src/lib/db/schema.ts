import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	json,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { CensoredUser } from "$lib/user";
import { numeric } from "drizzle-orm/pg-core";
import type { CensoredGroup } from "$lib/group";
import type { CensoredPack } from "$lib/pack";

export const rolesEnum = pgEnum("roles", ["User", "Moderator", "Admin"]);
export const packMessageType = pgEnum("messageType", ["public", "internal"]);

export const user = pgTable("user", {
	username: text("username").primaryKey(),
	passwordHash: text("password_hash").notNull(),
	role: rolesEnum("role").notNull().default("User"),
	karma: numeric("karma", { mode: "number" }).notNull().default(0),
	creationDate: timestamp("creation_date").notNull().defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	username: text("username")
		.notNull()
		.references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const gradualToken = pgTable("gradualToken", {
	id: text("id").primaryKey(),
	username: text("username")
		.notNull()
		.references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
	hashedToken: text("hashed_token").notNull(),
	permissions: text("permissions").array().notNull(),
});

export const userProfile = pgTable("userProfile", {
	username: text("username")
		.primaryKey()
		.references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
	aboutMe: text("about_me").notNull(),
	pronouns: text("pronouns"),
});

export const group = pgTable("group", {
	username: text("username").primaryKey(),
	karma: numeric("karma", { mode: "number" }).notNull().default(0),
	creationDate: timestamp("creation_date").notNull().defaultNow(),
});

export const groupProfile = pgTable("groupProfile", {
	username: text("username")
		.primaryKey()
		.references(() => group.username, { onUpdate: "cascade", onDelete: "cascade" }),
	aboutMe: text("about_me").notNull(),
});

export const groupMember = pgTable("groupMember", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	groupName: text("groupName")
		.notNull()
		.references(() => group.username, { onUpdate: "cascade", onDelete: "cascade" }),
	username: text("username")
		.notNull()
		.references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
	permissions: text("permissions").array().notNull(),
	accepted: boolean("accepted").notNull().default(false),
});

export const pack = pgTable("pack", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	ownerName: text("owner_name").notNull(),
	name: text("name").notNull(),
	metadataVersion: integer("metadata_version").notNull(),
	gameVersion: text("game_version").notNull(),
	packVersion: text("pack_version").notNull(),
	description: text("description").notNull(),
	license: text("license").notNull(),
	author: text("author").notNull(),
	permissions: text("permissions").array().notNull(),
	// TODO: Add requires.

	downloadCount: integer("download_count").notNull().default(0),
	unpackedSize: integer("unpacked_size").notNull(),

	isLatestVersion: boolean("is_latest_version").notNull().default(true),
	approved: boolean("approved").notNull(),
	approvedBy: text("approved_by").references(() => user.username, {
		onUpdate: "cascade",
		onDelete: "no action",
	}),
	approvedAt: timestamp("approved_at"),
	denied: boolean("denied").notNull().default(false),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const packLike = pgTable("packLike", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	// TODO: Delete pack likes when the pack is deleted.
	packOwnerName: text("pack_owner_name").notNull(),
	packName: text("pack_name").notNull(),
	username: text("username")
		.notNull()
		.references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
	dislike: boolean("dislike").notNull(),
});

export const packLink = pgTable("packLink", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	packId: uuid("pack_id")
		.notNull()
		.references(() => pack.id, { onDelete: "cascade" }),
	key: text("key").notNull(),
	value: text("value").notNull(),
});

export const card = pgTable("card", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	uuid: uuid("uuid").notNull(),
	abilities: text("abilities").array().notNull(),

	packId: uuid("pack_id")
		.notNull()
		.references(() => pack.id, { onDelete: "cascade" }),

	name: text("name").notNull(),
	text: text("text").notNull(),
	cost: integer("cost").notNull(),
	type: text("type").notNull(),
	classes: text("classes").array().notNull(),
	rarity: text("rarity").notNull(),
	collectible: boolean("collectible").notNull(),
	tags: text("tags").array().notNull(),

	attack: integer("attack"),
	health: integer("health"),
	tribes: text("tribes").array(),

	spellSchools: text("spellSchools").array(),

	durability: integer("durability"),
	cooldown: integer("cooldown"),

	armor: integer("armor"),
	heropowerId: uuid("heropower_id"),

	enchantmentPriority: integer("enchantment_priority"),

	approved: boolean("approved").notNull(),
	isLatestVersion: boolean("is_latest_version").notNull().default(true),
	filePath: text("filePath").notNull(),
});

export const comment = pgTable("comment", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	username: text("username").references(() => user.username, {
		onUpdate: "cascade",
		onDelete: "set null",
	}),
	packId: uuid("pack_id")
		.notNull()
		.references(() => pack.id, { onDelete: "cascade" }),
	creationDate: timestamp().notNull().defaultNow(),

	text: text("text").notNull(),
	heartedByUsername: text("hearted_by_username").references(() => user.username, {
		onUpdate: "cascade",
		onDelete: "no action",
	}),

	cardUUID: uuid("card_uuid"),
});

export const commentLike = pgTable("commentLike", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	commentId: uuid("comment_id")
		.notNull()
		.references(() => comment.id, { onDelete: "cascade" }),
	username: text("username")
		.notNull()
		.references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
	dislike: boolean("dislike").notNull(),
});

export const packMessage = pgTable("packMessage", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	username: text("username").references(() => user.username, {
		onUpdate: "cascade",
		onDelete: "set null",
	}),
	packId: uuid("pack_id").notNull(),
	creationDate: timestamp().notNull().defaultNow(),

	type: packMessageType().notNull(),
	text: text("text").notNull(),
});

export const notification = pgTable("notification", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	username: text("user_id")
		.notNull()
		.references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
	date: timestamp("date").notNull().defaultNow(),

	text: text("text").notNull(),
	route: text("route"),
});

export const setting = pgTable("setting", {
	key: text("key").primaryKey(),
	value: json("value"),
	description: text("description"),
});

export type Session = typeof session.$inferSelect;
export type GradualToken = typeof gradualToken.$inferSelect;
export type User = typeof user.$inferSelect;
export type Role = (typeof rolesEnum.enumValues)[number];
export type UserProfile = typeof userProfile.$inferSelect;
export type Group = typeof group.$inferSelect;
export type GroupProfile = typeof groupProfile.$inferSelect;
export type GroupMember = typeof groupMember.$inferSelect;

export type Pack = typeof pack.$inferSelect;
export type Card = typeof card.$inferSelect;

export type Comment = typeof comment.$inferSelect;
export type PackMessage = typeof packMessage.$inferSelect;

export type Notification = typeof notification.$inferSelect;
export type Setting = typeof setting.$inferSelect;

export type PackWithExtras = Pack & {
	owner: CensoredUser | Group | null;
	totalDownloadCount: number;
	likes: {
		positive: number;
		negative: number;
		hasLiked: boolean;
		hasDisliked: boolean;
	};
	approvedByUser: CensoredUser | null;
	messages: (PackMessage & { author: CensoredUser | null })[];
};

export type CommentWithExtras = Comment & {
	author: CensoredUser | null;
	pack: CensoredPack;
	likes: {
		positive: number;
		negative: number;
		hasLiked: boolean;
		hasDisliked: boolean;
	};
	heartedBy: CensoredUser | null;
};

export type GroupWithExtras = CensoredGroup & {
	members: GroupMember[];
};

export type GroupMemberWithExtras = GroupMember & {
	user: CensoredUser | null;
};
