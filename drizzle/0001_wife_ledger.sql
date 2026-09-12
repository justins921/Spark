-- Split the wife ledger into what is owed and what has been paid.
-- The existing rows are cash already handed over, so they become kind 'paid'.
ALTER TABLE "wife_payments" RENAME TO "wife_ledger";--> statement-breakpoint
ALTER TABLE "wife_ledger" RENAME CONSTRAINT "wife_payments_seed_key_unique" TO "wife_ledger_seed_key_unique";--> statement-breakpoint
ALTER INDEX "wife_payments_pkey" RENAME TO "wife_ledger_pkey";--> statement-breakpoint
ALTER SEQUENCE "wife_payments_id_seq" RENAME TO "wife_ledger_id_seq";--> statement-breakpoint
ALTER TABLE "wife_ledger" ADD COLUMN "kind" text DEFAULT 'paid' NOT NULL;
