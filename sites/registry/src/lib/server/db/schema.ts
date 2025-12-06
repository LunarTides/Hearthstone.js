import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
	uuid: uuid("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
