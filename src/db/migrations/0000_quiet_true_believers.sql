CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"reward" integer NOT NULL,
	"deadline" timestamp NOT NULL,
	"posted_by" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
