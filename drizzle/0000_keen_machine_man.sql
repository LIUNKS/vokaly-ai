CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"track_slug" text NOT NULL,
	"job_description" text,
	"blueprint_content" text,
	"state" text DEFAULT 'configurando' NOT NULL,
	"scorecard" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"concluded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"phone" text,
	"years_of_experience" text,
	"career_path" text,
	"skills" text,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;