import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	creationDate: timestamp().defaultNow(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const pack = pgTable("pack", {
	id: uuid("id").primaryKey().defaultRandom(),
	uuid: uuid("uuid").notNull(),
	userIds: text("user_ids").array().notNull(),
	metadataVersion: integer("metadata_version").notNull(),
	gameVersion: text("game_version").notNull(),
	packVersion: text("pack_version").notNull(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	license: text("license").notNull(),
	authors: text("authors").array().notNull(),
	// TODO: Add requires.

	isLatestVersion: boolean("is_latest_version").notNull().default(true),
	approved: boolean().notNull(),
});

export const packRelations = relations(pack, ({ many }) => ({
	links: many(packLink),
	cards: many(card),
	users: many(user, { relationName: "user_ids" }),
}));

export const packLink = pgTable("packLinks", {
	id: uuid("id").defaultRandom().primaryKey(),
	packId: uuid("pack_id").references(() => pack.id, { onDelete: "cascade" }),
	key: text("key").notNull(),
	value: text("value").notNull(),
});

export const card = pgTable("card", {
	id: uuid("id").primaryKey(),
	uuid: uuid("uuid").notNull(),
	abilities: text("abilities").array().notNull(),

	packId: uuid("pack_id")
		.references(() => pack.id)
		.notNull(),

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
	heropowerId: uuid("heropowerId"),

	enchantmentPriority: integer("enchantment_priority"),

	isLatestVersion: boolean("is_latest_version").notNull().default(true),
});

export const cardRelations = relations(card, ({ one }) => ({
	heropower: one(card, {
		fields: [card.heropowerId],
		references: [card.uuid],
	}),
}));

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
