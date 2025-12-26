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
import { relations } from "drizzle-orm";
import type { CensoredUser } from "$lib/user";

export const rolesEnum = pgEnum("roles", ["User", "Moderator", "Admin"]);

export const user = pgTable("user", {
	id: uuid("id").primaryKey(),
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	role: rolesEnum("role").notNull().default("User"),
	creationDate: timestamp("creation_date").notNull().defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const profile = pgTable("profile", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id),
	aboutMe: text("about_me").notNull(),
	pronouns: text("pronouns"),
});

export const pack = pgTable("pack", {
	id: uuid("id").primaryKey().defaultRandom(),
	uuid: uuid("uuid").notNull(),
	userIds: uuid("user_ids").array().notNull(),
	metadataVersion: integer("metadata_version").notNull(),
	gameVersion: text("game_version").notNull(),
	packVersion: text("pack_version").notNull(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	license: text("license").notNull(),
	authors: text("authors").array().notNull(),
	// TODO: Add requires.

	downloadCount: integer("download_count").notNull().default(0),
	unpackedSize: integer("unpacked_size").notNull(),

	isLatestVersion: boolean("is_latest_version").notNull().default(true),
	approved: boolean("approved").notNull(),
	approvedBy: uuid("approved_by").references(() => user.id, { onDelete: "set null" }),
	approvedAt: timestamp("approved_at"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const packRelations = relations(pack, ({ many }) => ({
	cards: many(card),
	likes: many(packLike),
	links: many(packLink),
	comments: many(packComment),
	users: many(user, { relationName: "user_ids" }),
}));

export const packLike = pgTable("packLike", {
	id: uuid("id").primaryKey().defaultRandom(),
	// TODO: Delete pack likes when the pack is deleted.
	packId: uuid("pack_id").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	dislike: boolean("dislike").notNull(),
});

export const packLikeRelations = relations(pack, ({ one }) => ({
	packs: one(pack),
}));

export const packLink = pgTable("packLink", {
	id: uuid("id").defaultRandom().primaryKey(),
	packId: uuid("pack_id")
		.notNull()
		.references(() => pack.id, { onDelete: "cascade" }),
	key: text("key").notNull(),
	value: text("value").notNull(),
});

export const card = pgTable("card", {
	id: uuid("id").primaryKey(),
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
});

export const cardRelations = relations(card, ({ one }) => ({
	heropower: one(card, {
		fields: [card.heropowerId],
		references: [card.uuid],
	}),
}));

export const packComment = pgTable("packComment", {
	id: uuid("id").primaryKey().defaultRandom(),
	authorId: uuid("author_id").references(() => user.id, { onDelete: "set null" }),
	packId: uuid("pack_id").notNull(),
	creationDate: timestamp().notNull().defaultNow(),

	text: text("text").notNull(),
	heartedById: uuid("hearted_by_id"),
});

export const packCommentRelations = relations(packComment, ({ many }) => ({
	likes: many(packCommentLike),
}));

export const packCommentLike = pgTable("packCommentLike", {
	id: uuid("id").primaryKey().defaultRandom(),
	commentId: uuid("comment_id")
		.notNull()
		.references(() => packComment.id, { onDelete: "cascade" }),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id),
	dislike: boolean("dislike").notNull(),
});

export const notification = pgTable("notification", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
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
export type User = typeof user.$inferSelect;
export type Role = (typeof rolesEnum.enumValues)[number];
export type Profile = typeof profile.$inferSelect;

export type Pack = typeof pack.$inferSelect;
export type Card = typeof card.$inferSelect;

export type PackComment = typeof packComment.$inferSelect;

export type Notification = typeof notification.$inferSelect;
export type Setting = typeof setting.$inferSelect;

export type PackWithExtras = Pack & {
	totalDownloadCount: number;
	likes: {
		positive: number;
		negative: number;
		hasLiked: boolean;
		hasDisliked: boolean;
	};
	approvedByUser: CensoredUser | null;
};

export type PackCommentWithExtras = PackComment & {
	author: CensoredUser | null;
	likes: {
		positive: number;
		negative: number;
		hasLiked: boolean;
		hasDisliked: boolean;
	};
	heartedBy: CensoredUser | null;
};
