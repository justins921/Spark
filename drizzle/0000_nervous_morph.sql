CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"kind" text NOT NULL,
	"est_base" numeric(10, 2),
	"est_tip" numeric(10, 2),
	"base" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tip" numeric(10, 2) DEFAULT '0' NOT NULL,
	"wife_along" boolean DEFAULT false NOT NULL,
	"wife_paid_override" numeric(10, 2),
	"trip_number" text,
	"orders" integer,
	"completed_time" text,
	"order_number" text,
	"delivered_date" date,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seed_key" text,
	CONSTRAINT "entries_seed_key_unique" UNIQUE("seed_key")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"weekly_goal" numeric(10, 2) DEFAULT '500' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wife_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"seed_key" text,
	CONSTRAINT "wife_payments_seed_key_unique" UNIQUE("seed_key")
);
