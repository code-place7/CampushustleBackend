CREATE TABLE "task_applicants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"task_id" integer NOT NULL,
	"applied_at" timestamp DEFAULT now()
);
