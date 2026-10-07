CREATE TYPE "public"."action" AS ENUM('subscribe', 'unsubscribe', 'update', 'export', 'delete');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('en', 'nl');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'active', 'unsubscribed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."template_type" AS ENUM('welcome', 'newsletter', 'unsubscribe_confirm', 'data_export');--> statement-breakpoint
CREATE TABLE "consent_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"action" "action" NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"language" "language" NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "template_type" NOT NULL,
	"language" "language" NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gdpr_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_key" text NOT NULL,
	"language" "language" NOT NULL,
	"content" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"preferred_language" "language" DEFAULT 'en' NOT NULL,
	"subscribed_date" timestamp DEFAULT now() NOT NULL,
	"consent_timestamp" timestamp NOT NULL,
	"consent_ip" "inet",
	"consent_user_agent" text,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"unsubscribe_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"verification_token" uuid DEFAULT gen_random_uuid(),
	"verified_at" timestamp,
	"last_email_sent" timestamp,
	"email_count" text DEFAULT '0' NOT NULL,
	"bounce_count" text DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "subscribers_unsubscribe_token_unique" UNIQUE("unsubscribe_token"),
	CONSTRAINT "subscribers_verification_token_unique" UNIQUE("verification_token")
);
