CREATE TYPE "public"."messageType" AS ENUM('public', 'internal');--> statement-breakpoint
CREATE TABLE "packMessage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid,
	"pack_id" uuid NOT NULL,
	"creationDate" timestamp DEFAULT now() NOT NULL,
	"type" "messageType" NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "packMessage" ADD CONSTRAINT "packMessage_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;