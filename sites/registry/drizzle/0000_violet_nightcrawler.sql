CREATE TYPE "public"."messageType" AS ENUM('public', 'internal');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('User', 'Moderator', 'Admin');--> statement-breakpoint
CREATE TABLE "card" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"uuid" uuid NOT NULL,
	"abilities" text[] NOT NULL,
	"pack_id" uuid NOT NULL,
	"name" text NOT NULL,
	"text" text NOT NULL,
	"cost" integer NOT NULL,
	"type" text NOT NULL,
	"classes" text[] NOT NULL,
	"rarity" text NOT NULL,
	"collectible" boolean NOT NULL,
	"tags" text[] NOT NULL,
	"attack" integer,
	"health" integer,
	"tribes" text[],
	"spellSchools" text[],
	"durability" integer,
	"cooldown" integer,
	"armor" integer,
	"heropower_id" uuid,
	"enchantment_priority" integer,
	"approved" boolean NOT NULL,
	"is_latest_version" boolean DEFAULT true NOT NULL,
	"filePath" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"text" text NOT NULL,
	"route" text
);
--> statement-breakpoint
CREATE TABLE "pack" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"owner_name" text NOT NULL,
	"name" text NOT NULL,
	"metadata_version" integer NOT NULL,
	"game_version" text NOT NULL,
	"pack_version" text NOT NULL,
	"description" text NOT NULL,
	"license" text NOT NULL,
	"author" text NOT NULL,
	"permissions" text[] NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"unpacked_size" integer NOT NULL,
	"is_latest_version" boolean DEFAULT true NOT NULL,
	"approved" boolean NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"denied" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packComment" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"username" text,
	"pack_owner_name" text NOT NULL,
	"pack_name" text NOT NULL,
	"creationDate" timestamp DEFAULT now() NOT NULL,
	"text" text NOT NULL,
	"hearted_by_id" text
);
--> statement-breakpoint
CREATE TABLE "packCommentLike" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"comment_id" uuid NOT NULL,
	"username" text NOT NULL,
	"dislike" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packLike" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"pack_owner_name" text NOT NULL,
	"pack_name" text NOT NULL,
	"username" text NOT NULL,
	"dislike" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packLink" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"pack_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packMessage" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"username" text,
	"pack_id" uuid NOT NULL,
	"creationDate" timestamp DEFAULT now() NOT NULL,
	"type" "messageType" NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"username" text PRIMARY KEY NOT NULL,
	"about_me" text NOT NULL,
	"pronouns" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" json,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"username" text PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"role" "roles" DEFAULT 'User' NOT NULL,
	"creation_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_pack_id_pack_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."pack"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_username_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack" ADD CONSTRAINT "pack_approved_by_user_username_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("username") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packComment" ADD CONSTRAINT "packComment_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packComment" ADD CONSTRAINT "packComment_hearted_by_id_user_username_fk" FOREIGN KEY ("hearted_by_id") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packCommentLike" ADD CONSTRAINT "packCommentLike_comment_id_packComment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."packComment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packCommentLike" ADD CONSTRAINT "packCommentLike_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packLike" ADD CONSTRAINT "packLike_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packLink" ADD CONSTRAINT "packLink_pack_id_pack_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."pack"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packMessage" ADD CONSTRAINT "packMessage_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE no action;