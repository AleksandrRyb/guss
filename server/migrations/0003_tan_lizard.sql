CREATE TABLE "round_stats" (
	"round_id" uuid NOT NULL,
	"players_total" integer DEFAULT 0 NOT NULL,
	"taps_total" integer DEFAULT 0 NOT NULL,
	"score_total" integer DEFAULT 0 NOT NULL,
	"winner_user_id" uuid,
	"winner_username" text,
	"winner_score" integer,
	CONSTRAINT "round_stats_pk" PRIMARY KEY("round_id")
);
--> statement-breakpoint
CREATE TABLE "round_users" (
	"round_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"taps" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "round_users_pk" PRIMARY KEY("round_id","user_id")
);
--> statement-breakpoint
CREATE INDEX "round_users_round_score_idx" ON "round_users" USING btree ("round_id","score");