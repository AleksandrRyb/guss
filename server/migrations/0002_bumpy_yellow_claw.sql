CREATE INDEX "rounds_status_start_idx" ON "rounds" USING btree ("status","start_at");--> statement-breakpoint
CREATE INDEX "rounds_status_end_idx" ON "rounds" USING btree ("status","end_at");--> statement-breakpoint
ALTER TABLE "rounds" DROP COLUMN "duration_sec";--> statement-breakpoint
ALTER TABLE "rounds" DROP COLUMN "cooldown_sec";--> statement-breakpoint
ALTER TABLE "rounds" DROP COLUMN "players_count";--> statement-breakpoint
ALTER TABLE "rounds" DROP COLUMN "winner_user_id";--> statement-breakpoint
ALTER TABLE "rounds" DROP COLUMN "total_taps";--> statement-breakpoint
ALTER TABLE "rounds" DROP COLUMN "total_score";--> statement-breakpoint
ALTER TABLE "rounds" DROP COLUMN "version";