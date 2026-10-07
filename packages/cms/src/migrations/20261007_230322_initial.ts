import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_pages_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_pages_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_pages_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum_pages_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum_pages_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_events_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_events_event_type" AS ENUM('talk', 'workshop', 'lecture', 'meeting', 'board-meeting', 'soup-kitchen', 'csa', 'excursion');
  CREATE TYPE "public"."enum_past_events_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_past_events_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_past_events_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum_past_events_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum_past_events_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_past_events_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_past_events_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_past_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__past_events_v_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__past_events_v_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__past_events_v_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum__past_events_v_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum__past_events_v_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__past_events_v_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__past_events_v_version_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum__past_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__past_events_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_newsletters_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_newsletters_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_newsletters_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum_newsletters_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum_newsletters_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_newsletters_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_newsletters_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_newsletters_type" AS ENUM('article', 'link', 'event', 'update');
  CREATE TYPE "public"."enum_newsletters_organization" AS ENUM('Boerengroep', 'Inspringtheater', 'friends');
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__newsletters_v_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__newsletters_v_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__newsletters_v_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum__newsletters_v_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum__newsletters_v_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__newsletters_v_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__newsletters_v_version_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum__newsletters_v_version_type" AS ENUM('article', 'link', 'event', 'update');
  CREATE TYPE "public"."enum__newsletters_v_version_organization" AS ENUM('Boerengroep', 'Inspringtheater', 'friends');
  CREATE TYPE "public"."enum__newsletters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__newsletters_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_vacancies_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_vacancies_opportunity_type" AS ENUM('volunteer', 'internship', 'coordinator', 'board', 'other');
  CREATE TYPE "public"."enum_vacancies_location_type" AS ENUM('remote', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_site_settings_header_color" AS ENUM('default', 'primary');
  CREATE TYPE "public"."enum_site_settings_theme_font" AS ENUM('sans', 'nunito', 'lato');
  CREATE TYPE "public"."enum_site_settings_theme_dark_mode" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('super-admin', 'user');
  CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('tenant-admin', 'editor');
  CREATE TABLE "pages_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_pages_blocks_hero_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"headline" varchar,
  	"tagline" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"image_video_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_events_calendar_preview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"text" varchar,
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"title" varchar,
  	"text" jsonb
  );
  
  CREATE TABLE "pages_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stat" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_pages_blocks_cta_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonial_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"avatar_id" integer
  );
  
  CREATE TABLE "pages_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"color" "enum_pages_blocks_video_color",
  	"url" varchar,
  	"auto_play" boolean,
  	"loop" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum_pages_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum_pages_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum_pages_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"parent_id" integer,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__pages_v_blocks_hero_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"headline" varchar,
  	"tagline" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"image_video_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_events_calendar_preview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"text" varchar,
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"title" varchar,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stat" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__pages_v_blocks_cta_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"avatar_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"color" "enum__pages_v_blocks_video_color",
  	"url" varchar,
  	"auto_play" boolean,
  	"loop" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum__pages_v_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum__pages_v_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum__pages_v_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_parent_id" integer,
  	"version_legacy_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_path" varchar,
  	"version_body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "events_speakers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"speaker_id" integer,
  	"role" varchar
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"language" "enum_events_language",
  	"description" varchar,
  	"location_address" varchar,
  	"location_maps_link" varchar,
  	"location_call_link" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"event_type" "enum_events_event_type" NOT NULL,
  	"image_id" integer,
  	"cover_image_id" integer,
  	"featured" boolean,
  	"registration_link" jsonb,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "past_events_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_past_events_blocks_hero_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "past_events_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"headline" varchar,
  	"tagline" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"image_video_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"text" varchar,
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"title" varchar,
  	"text" jsonb
  );
  
  CREATE TABLE "past_events_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stat" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "past_events_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_cta_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_past_events_blocks_cta_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "past_events_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_testimonial_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"avatar_id" integer
  );
  
  CREATE TABLE "past_events_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"color" "enum_past_events_blocks_video_color",
  	"url" varchar,
  	"auto_play" boolean,
  	"loop" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum_past_events_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum_past_events_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum_past_events_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"language" "enum_past_events_language",
  	"hero_img_id" integer,
  	"excerpt" jsonb,
  	"author_id" integer,
  	"date" timestamp(3) with time zone,
  	"related_event_id" integer,
  	"body" jsonb,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_past_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "past_events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_past_events_v_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__past_events_v_blocks_hero_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"headline" varchar,
  	"tagline" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"image_video_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"text" varchar,
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"title" varchar,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stat" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_cta_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__past_events_v_blocks_cta_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_testimonial_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"avatar_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"color" "enum__past_events_v_blocks_video_color",
  	"url" varchar,
  	"auto_play" boolean,
  	"loop" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum__past_events_v_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum__past_events_v_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum__past_events_v_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_language" "enum__past_events_v_version_language",
  	"version_hero_img_id" integer,
  	"version_excerpt" jsonb,
  	"version_author_id" integer,
  	"version_date" timestamp(3) with time zone,
  	"version_related_event_id" integer,
  	"version_body" jsonb,
  	"version_legacy_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__past_events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__past_events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_past_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "newsletters_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_newsletters_blocks_hero_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "newsletters_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"headline" varchar,
  	"tagline" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"image_video_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"text" varchar,
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"title" varchar,
  	"text" jsonb
  );
  
  CREATE TABLE "newsletters_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stat" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "newsletters_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_cta_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_newsletters_blocks_cta_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "newsletters_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_testimonial_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"avatar_id" integer
  );
  
  CREATE TABLE "newsletters_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"color" "enum_newsletters_blocks_video_color",
  	"url" varchar,
  	"auto_play" boolean,
  	"loop" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum_newsletters_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum_newsletters_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum_newsletters_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"language" "enum_newsletters_language",
  	"type" "enum_newsletters_type",
  	"organization" "enum_newsletters_organization",
  	"publish_date" timestamp(3) with time zone,
  	"external_link" varchar,
  	"link_description" varchar,
  	"author_id" integer,
  	"featured_image_id" integer,
  	"excerpt" jsonb,
  	"featured" boolean,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_newsletters_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "newsletters_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__newsletters_v_blocks_hero_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"headline" varchar,
  	"tagline" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"image_video_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"text" varchar,
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"title" varchar,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stat" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_cta_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__newsletters_v_blocks_cta_actions_type",
  	"icon_name" varchar,
  	"icon_color" varchar,
  	"icon_style" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_testimonial_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"avatar_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"color" "enum__newsletters_v_blocks_video_color",
  	"url" varchar,
  	"auto_play" boolean,
  	"loop" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" varchar,
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum__newsletters_v_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum__newsletters_v_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum__newsletters_v_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_language" "enum__newsletters_v_version_language",
  	"version_type" "enum__newsletters_v_version_type",
  	"version_organization" "enum__newsletters_v_version_organization",
  	"version_publish_date" timestamp(3) with time zone,
  	"version_external_link" varchar,
  	"version_link_description" varchar,
  	"version_author_id" integer,
  	"version_featured_image_id" integer,
  	"version_excerpt" jsonb,
  	"version_featured" boolean,
  	"version_legacy_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__newsletters_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__newsletters_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_newsletters_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "vacancies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"language" "enum_vacancies_language",
  	"opportunity_type" "enum_vacancies_opportunity_type" NOT NULL,
  	"location_type" "enum_vacancies_location_type",
  	"location_city_region" varchar,
  	"start_date" timestamp(3) with time zone,
  	"duration" varchar,
  	"open_application" boolean,
  	"application_deadline" timestamp(3) with time zone,
  	"description" jsonb,
  	"responsibilities" jsonb,
  	"preferred_qualities" jsonb,
  	"compensation_details" varchar,
  	"accessibility_notes" varchar,
  	"how_to_apply" jsonb,
  	"contact_info_name" varchar,
  	"contact_info_email" varchar,
  	"contact_info_phone" varchar,
  	"supporting_document_id" integer,
  	"values_statement" jsonb,
  	"open_to_nontraditional" boolean,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vacancies_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "speakers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"avatar_id" integer,
  	"affiliation" varchar,
  	"bio" jsonb,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"avatar_id" integer,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"alt" varchar,
  	"legacy_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"permanent" boolean,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_header_nav_submenu" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer,
  	"href" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings_header_nav_submenu_locales" (
  	"label_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_header_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer,
  	"href" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings_header_nav_locales" (
  	"label_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_quick_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer,
  	"href" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings_footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"header_logo_id" integer,
  	"header_logo_alt" varchar NOT NULL,
  	"header_name" varchar NOT NULL,
  	"header_color" "enum_site_settings_header_color",
  	"homepage_show_calendar_widget" boolean,
  	"theme_color" varchar,
  	"theme_font" "enum_site_settings_theme_font",
  	"theme_dark_mode" "enum_site_settings_theme_dark_mode",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenants_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"site_url" varchar NOT NULL,
  	"revalidate_secret" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"events_id" integer,
  	"past_events_id" integer,
  	"newsletters_id" integer,
  	"vacancies_id" integer,
  	"speakers_id" integer,
  	"authors_id" integer,
  	"tags_id" integer,
  	"media_id" integer,
  	"redirects_id" integer,
  	"site_settings_id" integer,
  	"users_id" integer,
  	"tenants_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero_actions" ADD CONSTRAINT "pages_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_events_calendar_preview" ADD CONSTRAINT "pages_blocks_events_calendar_preview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_items" ADD CONSTRAINT "pages_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features" ADD CONSTRAINT "pages_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_stats" ADD CONSTRAINT "pages_blocks_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_actions" ADD CONSTRAINT "pages_blocks_cta_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial" ADD CONSTRAINT "pages_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_actions" ADD CONSTRAINT "_pages_v_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_events_calendar_preview" ADD CONSTRAINT "_pages_v_blocks_events_calendar_preview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_items" ADD CONSTRAINT "_pages_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features" ADD CONSTRAINT "_pages_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_stats" ADD CONSTRAINT "_pages_v_blocks_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_actions" ADD CONSTRAINT "_pages_v_blocks_cta_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial" ADD CONSTRAINT "_pages_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_speakers" ADD CONSTRAINT "events_speakers_speaker_id_speakers_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_speakers" ADD CONSTRAINT "events_speakers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_hero_actions" ADD CONSTRAINT "past_events_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_hero" ADD CONSTRAINT "past_events_blocks_hero_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_hero" ADD CONSTRAINT "past_events_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_callout" ADD CONSTRAINT "past_events_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_features_items" ADD CONSTRAINT "past_events_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_features" ADD CONSTRAINT "past_events_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_stats_stats" ADD CONSTRAINT "past_events_blocks_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_stats" ADD CONSTRAINT "past_events_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_cta_actions" ADD CONSTRAINT "past_events_blocks_cta_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_cta" ADD CONSTRAINT "past_events_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_content" ADD CONSTRAINT "past_events_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_testimonial_testimonials" ADD CONSTRAINT "past_events_blocks_testimonial_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_testimonial_testimonials" ADD CONSTRAINT "past_events_blocks_testimonial_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_testimonial" ADD CONSTRAINT "past_events_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_video" ADD CONSTRAINT "past_events_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_image_text" ADD CONSTRAINT "past_events_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_image_text" ADD CONSTRAINT "past_events_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_hero_img_id_media_id_fk" FOREIGN KEY ("hero_img_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_related_event_id_events_id_fk" FOREIGN KEY ("related_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_rels" ADD CONSTRAINT "past_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_rels" ADD CONSTRAINT "past_events_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_hero_actions" ADD CONSTRAINT "_past_events_v_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_hero" ADD CONSTRAINT "_past_events_v_blocks_hero_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_hero" ADD CONSTRAINT "_past_events_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_callout" ADD CONSTRAINT "_past_events_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_features_items" ADD CONSTRAINT "_past_events_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_features" ADD CONSTRAINT "_past_events_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_stats_stats" ADD CONSTRAINT "_past_events_v_blocks_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_stats" ADD CONSTRAINT "_past_events_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_cta_actions" ADD CONSTRAINT "_past_events_v_blocks_cta_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_cta" ADD CONSTRAINT "_past_events_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_content" ADD CONSTRAINT "_past_events_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_testimonial_testimonials" ADD CONSTRAINT "_past_events_v_blocks_testimonial_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_testimonial_testimonials" ADD CONSTRAINT "_past_events_v_blocks_testimonial_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_testimonial" ADD CONSTRAINT "_past_events_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_video" ADD CONSTRAINT "_past_events_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_image_text" ADD CONSTRAINT "_past_events_v_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_image_text" ADD CONSTRAINT "_past_events_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_parent_id_past_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_hero_img_id_media_id_fk" FOREIGN KEY ("version_hero_img_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_related_event_id_events_id_fk" FOREIGN KEY ("version_related_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_rels" ADD CONSTRAINT "_past_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_rels" ADD CONSTRAINT "_past_events_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_hero_actions" ADD CONSTRAINT "newsletters_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_hero" ADD CONSTRAINT "newsletters_blocks_hero_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_hero" ADD CONSTRAINT "newsletters_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_callout" ADD CONSTRAINT "newsletters_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_features_items" ADD CONSTRAINT "newsletters_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_features" ADD CONSTRAINT "newsletters_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_stats_stats" ADD CONSTRAINT "newsletters_blocks_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_stats" ADD CONSTRAINT "newsletters_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_cta_actions" ADD CONSTRAINT "newsletters_blocks_cta_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_cta" ADD CONSTRAINT "newsletters_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_content" ADD CONSTRAINT "newsletters_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_testimonial_testimonials" ADD CONSTRAINT "newsletters_blocks_testimonial_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_testimonial_testimonials" ADD CONSTRAINT "newsletters_blocks_testimonial_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_testimonial" ADD CONSTRAINT "newsletters_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_video" ADD CONSTRAINT "newsletters_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_image_text" ADD CONSTRAINT "newsletters_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_image_text" ADD CONSTRAINT "newsletters_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_author_id_speakers_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_texts" ADD CONSTRAINT "newsletters_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_hero_actions" ADD CONSTRAINT "_newsletters_v_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_hero" ADD CONSTRAINT "_newsletters_v_blocks_hero_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_hero" ADD CONSTRAINT "_newsletters_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_callout" ADD CONSTRAINT "_newsletters_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_features_items" ADD CONSTRAINT "_newsletters_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_features" ADD CONSTRAINT "_newsletters_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_stats_stats" ADD CONSTRAINT "_newsletters_v_blocks_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_stats" ADD CONSTRAINT "_newsletters_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_cta_actions" ADD CONSTRAINT "_newsletters_v_blocks_cta_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_cta" ADD CONSTRAINT "_newsletters_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_content" ADD CONSTRAINT "_newsletters_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_testimonial_testimonials" ADD CONSTRAINT "_newsletters_v_blocks_testimonial_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_testimonial_testimonials" ADD CONSTRAINT "_newsletters_v_blocks_testimonial_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_testimonial" ADD CONSTRAINT "_newsletters_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_video" ADD CONSTRAINT "_newsletters_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_image_text" ADD CONSTRAINT "_newsletters_v_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_image_text" ADD CONSTRAINT "_newsletters_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_parent_id_newsletters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_version_author_id_speakers_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_texts" ADD CONSTRAINT "_newsletters_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_supporting_document_id_media_id_fk" FOREIGN KEY ("supporting_document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vacancies_texts" ADD CONSTRAINT "vacancies_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "speakers" ADD CONSTRAINT "speakers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "speakers" ADD CONSTRAINT "speakers_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_submenu" ADD CONSTRAINT "site_settings_header_nav_submenu_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_submenu" ADD CONSTRAINT "site_settings_header_nav_submenu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_header_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_submenu_locales" ADD CONSTRAINT "site_settings_header_nav_submenu_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_header_nav_submenu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav" ADD CONSTRAINT "site_settings_header_nav_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav" ADD CONSTRAINT "site_settings_header_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_locales" ADD CONSTRAINT "site_settings_header_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_header_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_social" ADD CONSTRAINT "site_settings_footer_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_quick_links_links" ADD CONSTRAINT "site_settings_footer_quick_links_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_footer_quick_links_links" ADD CONSTRAINT "site_settings_footer_quick_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_quick_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_quick_links" ADD CONSTRAINT "site_settings_footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_header_logo_id_media_id_fk" FOREIGN KEY ("header_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_past_events_fk" FOREIGN KEY ("past_events_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletters_fk" FOREIGN KEY ("newsletters_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vacancies_fk" FOREIGN KEY ("vacancies_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_speakers_fk" FOREIGN KEY ("speakers_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_settings_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_actions_order_idx" ON "pages_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_actions_parent_id_idx" ON "pages_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_actions_locale_idx" ON "pages_blocks_hero_actions" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_image_image_src_idx" ON "pages_blocks_hero" USING btree ("image_src_id");
  CREATE INDEX "pages_blocks_events_calendar_preview_order_idx" ON "pages_blocks_events_calendar_preview" USING btree ("_order");
  CREATE INDEX "pages_blocks_events_calendar_preview_parent_id_idx" ON "pages_blocks_events_calendar_preview" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_events_calendar_preview_path_idx" ON "pages_blocks_events_calendar_preview" USING btree ("_path");
  CREATE INDEX "pages_blocks_events_calendar_preview_locale_idx" ON "pages_blocks_events_calendar_preview" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_locale_idx" ON "pages_blocks_callout" USING btree ("_locale");
  CREATE INDEX "pages_blocks_features_items_order_idx" ON "pages_blocks_features_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_items_parent_id_idx" ON "pages_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_items_locale_idx" ON "pages_blocks_features_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_features_order_idx" ON "pages_blocks_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_parent_id_idx" ON "pages_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_path_idx" ON "pages_blocks_features" USING btree ("_path");
  CREATE INDEX "pages_blocks_features_locale_idx" ON "pages_blocks_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_stats_order_idx" ON "pages_blocks_stats_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_stats_parent_id_idx" ON "pages_blocks_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_stats_locale_idx" ON "pages_blocks_stats_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_locale_idx" ON "pages_blocks_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_actions_order_idx" ON "pages_blocks_cta_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_actions_parent_id_idx" ON "pages_blocks_cta_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_actions_locale_idx" ON "pages_blocks_cta_actions" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_locale_idx" ON "pages_blocks_content" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_testimonials_order_idx" ON "pages_blocks_testimonial_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_testimonials_parent_id_idx" ON "pages_blocks_testimonial_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_testimonials_locale_idx" ON "pages_blocks_testimonial_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_testimonials_avatar_idx" ON "pages_blocks_testimonial_testimonials" USING btree ("avatar_id");
  CREATE INDEX "pages_blocks_testimonial_order_idx" ON "pages_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_parent_id_idx" ON "pages_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_path_idx" ON "pages_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_locale_idx" ON "pages_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_locale_idx" ON "pages_blocks_video" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_locale_idx" ON "pages_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_text_image_image_src_idx" ON "pages_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_legacy_id_idx" ON "pages" USING btree ("legacy_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_path_idx" ON "pages_locales" USING btree ("path","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_actions_order_idx" ON "_pages_v_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_actions_parent_id_idx" ON "_pages_v_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_actions_locale_idx" ON "_pages_v_blocks_hero_actions" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_image_image_src_idx" ON "_pages_v_blocks_hero" USING btree ("image_src_id");
  CREATE INDEX "_pages_v_blocks_events_calendar_preview_order_idx" ON "_pages_v_blocks_events_calendar_preview" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_events_calendar_preview_parent_id_idx" ON "_pages_v_blocks_events_calendar_preview" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_events_calendar_preview_path_idx" ON "_pages_v_blocks_events_calendar_preview" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_events_calendar_preview_locale_idx" ON "_pages_v_blocks_events_calendar_preview" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_locale_idx" ON "_pages_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_items_order_idx" ON "_pages_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_items_parent_id_idx" ON "_pages_v_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_items_locale_idx" ON "_pages_v_blocks_features_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_order_idx" ON "_pages_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_parent_id_idx" ON "_pages_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_path_idx" ON "_pages_v_blocks_features" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_features_locale_idx" ON "_pages_v_blocks_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_stats_order_idx" ON "_pages_v_blocks_stats_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_stats_parent_id_idx" ON "_pages_v_blocks_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_stats_locale_idx" ON "_pages_v_blocks_stats_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_locale_idx" ON "_pages_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_actions_order_idx" ON "_pages_v_blocks_cta_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_actions_parent_id_idx" ON "_pages_v_blocks_cta_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_actions_locale_idx" ON "_pages_v_blocks_cta_actions" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_locale_idx" ON "_pages_v_blocks_content" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_testimonials_order_idx" ON "_pages_v_blocks_testimonial_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonial_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_testimonials_locale_idx" ON "_pages_v_blocks_testimonial_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_testimonials_avatar_idx" ON "_pages_v_blocks_testimonial_testimonials" USING btree ("avatar_id");
  CREATE INDEX "_pages_v_blocks_testimonial_order_idx" ON "_pages_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_parent_id_idx" ON "_pages_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_path_idx" ON "_pages_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_locale_idx" ON "_pages_v_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_locale_idx" ON "_pages_v_blocks_video" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_text_order_idx" ON "_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_text_parent_id_idx" ON "_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_path_idx" ON "_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_locale_idx" ON "_pages_v_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_text_image_image_src_idx" ON "_pages_v_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_legacy_id_idx" ON "_pages_v" USING btree ("version_legacy_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v_locales" USING btree ("version_path","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_speakers_order_idx" ON "events_speakers" USING btree ("_order");
  CREATE INDEX "events_speakers_parent_id_idx" ON "events_speakers" USING btree ("_parent_id");
  CREATE INDEX "events_speakers_speaker_idx" ON "events_speakers" USING btree ("speaker_id");
  CREATE INDEX "events_tenant_idx" ON "events" USING btree ("tenant_id");
  CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_cover_image_idx" ON "events" USING btree ("cover_image_id");
  CREATE INDEX "events_legacy_id_idx" ON "events" USING btree ("legacy_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "past_events_blocks_hero_actions_order_idx" ON "past_events_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "past_events_blocks_hero_actions_parent_id_idx" ON "past_events_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_hero_order_idx" ON "past_events_blocks_hero" USING btree ("_order");
  CREATE INDEX "past_events_blocks_hero_parent_id_idx" ON "past_events_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_hero_path_idx" ON "past_events_blocks_hero" USING btree ("_path");
  CREATE INDEX "past_events_blocks_hero_image_image_src_idx" ON "past_events_blocks_hero" USING btree ("image_src_id");
  CREATE INDEX "past_events_blocks_callout_order_idx" ON "past_events_blocks_callout" USING btree ("_order");
  CREATE INDEX "past_events_blocks_callout_parent_id_idx" ON "past_events_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_callout_path_idx" ON "past_events_blocks_callout" USING btree ("_path");
  CREATE INDEX "past_events_blocks_features_items_order_idx" ON "past_events_blocks_features_items" USING btree ("_order");
  CREATE INDEX "past_events_blocks_features_items_parent_id_idx" ON "past_events_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_features_order_idx" ON "past_events_blocks_features" USING btree ("_order");
  CREATE INDEX "past_events_blocks_features_parent_id_idx" ON "past_events_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_features_path_idx" ON "past_events_blocks_features" USING btree ("_path");
  CREATE INDEX "past_events_blocks_stats_stats_order_idx" ON "past_events_blocks_stats_stats" USING btree ("_order");
  CREATE INDEX "past_events_blocks_stats_stats_parent_id_idx" ON "past_events_blocks_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_stats_order_idx" ON "past_events_blocks_stats" USING btree ("_order");
  CREATE INDEX "past_events_blocks_stats_parent_id_idx" ON "past_events_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_stats_path_idx" ON "past_events_blocks_stats" USING btree ("_path");
  CREATE INDEX "past_events_blocks_cta_actions_order_idx" ON "past_events_blocks_cta_actions" USING btree ("_order");
  CREATE INDEX "past_events_blocks_cta_actions_parent_id_idx" ON "past_events_blocks_cta_actions" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_cta_order_idx" ON "past_events_blocks_cta" USING btree ("_order");
  CREATE INDEX "past_events_blocks_cta_parent_id_idx" ON "past_events_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_cta_path_idx" ON "past_events_blocks_cta" USING btree ("_path");
  CREATE INDEX "past_events_blocks_content_order_idx" ON "past_events_blocks_content" USING btree ("_order");
  CREATE INDEX "past_events_blocks_content_parent_id_idx" ON "past_events_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_content_path_idx" ON "past_events_blocks_content" USING btree ("_path");
  CREATE INDEX "past_events_blocks_testimonial_testimonials_order_idx" ON "past_events_blocks_testimonial_testimonials" USING btree ("_order");
  CREATE INDEX "past_events_blocks_testimonial_testimonials_parent_id_idx" ON "past_events_blocks_testimonial_testimonials" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_testimonial_testimonials_avatar_idx" ON "past_events_blocks_testimonial_testimonials" USING btree ("avatar_id");
  CREATE INDEX "past_events_blocks_testimonial_order_idx" ON "past_events_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "past_events_blocks_testimonial_parent_id_idx" ON "past_events_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_testimonial_path_idx" ON "past_events_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "past_events_blocks_video_order_idx" ON "past_events_blocks_video" USING btree ("_order");
  CREATE INDEX "past_events_blocks_video_parent_id_idx" ON "past_events_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_video_path_idx" ON "past_events_blocks_video" USING btree ("_path");
  CREATE INDEX "past_events_blocks_image_text_order_idx" ON "past_events_blocks_image_text" USING btree ("_order");
  CREATE INDEX "past_events_blocks_image_text_parent_id_idx" ON "past_events_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_image_text_path_idx" ON "past_events_blocks_image_text" USING btree ("_path");
  CREATE INDEX "past_events_blocks_image_text_image_image_src_idx" ON "past_events_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "past_events_tenant_idx" ON "past_events" USING btree ("tenant_id");
  CREATE INDEX "past_events_slug_idx" ON "past_events" USING btree ("slug");
  CREATE INDEX "past_events_hero_img_idx" ON "past_events" USING btree ("hero_img_id");
  CREATE INDEX "past_events_author_idx" ON "past_events" USING btree ("author_id");
  CREATE INDEX "past_events_related_event_idx" ON "past_events" USING btree ("related_event_id");
  CREATE INDEX "past_events_legacy_id_idx" ON "past_events" USING btree ("legacy_id");
  CREATE INDEX "past_events_updated_at_idx" ON "past_events" USING btree ("updated_at");
  CREATE INDEX "past_events_created_at_idx" ON "past_events" USING btree ("created_at");
  CREATE INDEX "past_events__status_idx" ON "past_events" USING btree ("_status");
  CREATE INDEX "past_events_rels_order_idx" ON "past_events_rels" USING btree ("order");
  CREATE INDEX "past_events_rels_parent_idx" ON "past_events_rels" USING btree ("parent_id");
  CREATE INDEX "past_events_rels_path_idx" ON "past_events_rels" USING btree ("path");
  CREATE INDEX "past_events_rels_tags_id_idx" ON "past_events_rels" USING btree ("tags_id");
  CREATE INDEX "_past_events_v_blocks_hero_actions_order_idx" ON "_past_events_v_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_hero_actions_parent_id_idx" ON "_past_events_v_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_hero_order_idx" ON "_past_events_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_hero_parent_id_idx" ON "_past_events_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_hero_path_idx" ON "_past_events_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_hero_image_image_src_idx" ON "_past_events_v_blocks_hero" USING btree ("image_src_id");
  CREATE INDEX "_past_events_v_blocks_callout_order_idx" ON "_past_events_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_callout_parent_id_idx" ON "_past_events_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_callout_path_idx" ON "_past_events_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_features_items_order_idx" ON "_past_events_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_features_items_parent_id_idx" ON "_past_events_v_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_features_order_idx" ON "_past_events_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_features_parent_id_idx" ON "_past_events_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_features_path_idx" ON "_past_events_v_blocks_features" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_stats_stats_order_idx" ON "_past_events_v_blocks_stats_stats" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_stats_stats_parent_id_idx" ON "_past_events_v_blocks_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_stats_order_idx" ON "_past_events_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_stats_parent_id_idx" ON "_past_events_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_stats_path_idx" ON "_past_events_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_cta_actions_order_idx" ON "_past_events_v_blocks_cta_actions" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_cta_actions_parent_id_idx" ON "_past_events_v_blocks_cta_actions" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_cta_order_idx" ON "_past_events_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_cta_parent_id_idx" ON "_past_events_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_cta_path_idx" ON "_past_events_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_content_order_idx" ON "_past_events_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_content_parent_id_idx" ON "_past_events_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_content_path_idx" ON "_past_events_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_testimonial_testimonials_order_idx" ON "_past_events_v_blocks_testimonial_testimonials" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_testimonial_testimonials_parent_id_idx" ON "_past_events_v_blocks_testimonial_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_testimonial_testimonials_avatar_idx" ON "_past_events_v_blocks_testimonial_testimonials" USING btree ("avatar_id");
  CREATE INDEX "_past_events_v_blocks_testimonial_order_idx" ON "_past_events_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_testimonial_parent_id_idx" ON "_past_events_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_testimonial_path_idx" ON "_past_events_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_video_order_idx" ON "_past_events_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_video_parent_id_idx" ON "_past_events_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_video_path_idx" ON "_past_events_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_image_text_order_idx" ON "_past_events_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_image_text_parent_id_idx" ON "_past_events_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_image_text_path_idx" ON "_past_events_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_image_text_image_image_src_idx" ON "_past_events_v_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "_past_events_v_parent_idx" ON "_past_events_v" USING btree ("parent_id");
  CREATE INDEX "_past_events_v_version_version_tenant_idx" ON "_past_events_v" USING btree ("version_tenant_id");
  CREATE INDEX "_past_events_v_version_version_slug_idx" ON "_past_events_v" USING btree ("version_slug");
  CREATE INDEX "_past_events_v_version_version_hero_img_idx" ON "_past_events_v" USING btree ("version_hero_img_id");
  CREATE INDEX "_past_events_v_version_version_author_idx" ON "_past_events_v" USING btree ("version_author_id");
  CREATE INDEX "_past_events_v_version_version_related_event_idx" ON "_past_events_v" USING btree ("version_related_event_id");
  CREATE INDEX "_past_events_v_version_version_legacy_id_idx" ON "_past_events_v" USING btree ("version_legacy_id");
  CREATE INDEX "_past_events_v_version_version_updated_at_idx" ON "_past_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_past_events_v_version_version_created_at_idx" ON "_past_events_v" USING btree ("version_created_at");
  CREATE INDEX "_past_events_v_version_version__status_idx" ON "_past_events_v" USING btree ("version__status");
  CREATE INDEX "_past_events_v_created_at_idx" ON "_past_events_v" USING btree ("created_at");
  CREATE INDEX "_past_events_v_updated_at_idx" ON "_past_events_v" USING btree ("updated_at");
  CREATE INDEX "_past_events_v_snapshot_idx" ON "_past_events_v" USING btree ("snapshot");
  CREATE INDEX "_past_events_v_published_locale_idx" ON "_past_events_v" USING btree ("published_locale");
  CREATE INDEX "_past_events_v_latest_idx" ON "_past_events_v" USING btree ("latest");
  CREATE INDEX "_past_events_v_rels_order_idx" ON "_past_events_v_rels" USING btree ("order");
  CREATE INDEX "_past_events_v_rels_parent_idx" ON "_past_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_past_events_v_rels_path_idx" ON "_past_events_v_rels" USING btree ("path");
  CREATE INDEX "_past_events_v_rels_tags_id_idx" ON "_past_events_v_rels" USING btree ("tags_id");
  CREATE INDEX "newsletters_blocks_hero_actions_order_idx" ON "newsletters_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_hero_actions_parent_id_idx" ON "newsletters_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_hero_order_idx" ON "newsletters_blocks_hero" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_hero_parent_id_idx" ON "newsletters_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_hero_path_idx" ON "newsletters_blocks_hero" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_hero_image_image_src_idx" ON "newsletters_blocks_hero" USING btree ("image_src_id");
  CREATE INDEX "newsletters_blocks_callout_order_idx" ON "newsletters_blocks_callout" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_callout_parent_id_idx" ON "newsletters_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_callout_path_idx" ON "newsletters_blocks_callout" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_features_items_order_idx" ON "newsletters_blocks_features_items" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_features_items_parent_id_idx" ON "newsletters_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_features_order_idx" ON "newsletters_blocks_features" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_features_parent_id_idx" ON "newsletters_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_features_path_idx" ON "newsletters_blocks_features" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_stats_stats_order_idx" ON "newsletters_blocks_stats_stats" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_stats_stats_parent_id_idx" ON "newsletters_blocks_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_stats_order_idx" ON "newsletters_blocks_stats" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_stats_parent_id_idx" ON "newsletters_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_stats_path_idx" ON "newsletters_blocks_stats" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_cta_actions_order_idx" ON "newsletters_blocks_cta_actions" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_cta_actions_parent_id_idx" ON "newsletters_blocks_cta_actions" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_cta_order_idx" ON "newsletters_blocks_cta" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_cta_parent_id_idx" ON "newsletters_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_cta_path_idx" ON "newsletters_blocks_cta" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_content_order_idx" ON "newsletters_blocks_content" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_content_parent_id_idx" ON "newsletters_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_content_path_idx" ON "newsletters_blocks_content" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_testimonial_testimonials_order_idx" ON "newsletters_blocks_testimonial_testimonials" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_testimonial_testimonials_parent_id_idx" ON "newsletters_blocks_testimonial_testimonials" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_testimonial_testimonials_avatar_idx" ON "newsletters_blocks_testimonial_testimonials" USING btree ("avatar_id");
  CREATE INDEX "newsletters_blocks_testimonial_order_idx" ON "newsletters_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_testimonial_parent_id_idx" ON "newsletters_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_testimonial_path_idx" ON "newsletters_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_video_order_idx" ON "newsletters_blocks_video" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_video_parent_id_idx" ON "newsletters_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_video_path_idx" ON "newsletters_blocks_video" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_image_text_order_idx" ON "newsletters_blocks_image_text" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_image_text_parent_id_idx" ON "newsletters_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_image_text_path_idx" ON "newsletters_blocks_image_text" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_image_text_image_image_src_idx" ON "newsletters_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "newsletters_tenant_idx" ON "newsletters" USING btree ("tenant_id");
  CREATE INDEX "newsletters_slug_idx" ON "newsletters" USING btree ("slug");
  CREATE INDEX "newsletters_author_idx" ON "newsletters" USING btree ("author_id");
  CREATE INDEX "newsletters_featured_image_idx" ON "newsletters" USING btree ("featured_image_id");
  CREATE INDEX "newsletters_legacy_id_idx" ON "newsletters" USING btree ("legacy_id");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  CREATE INDEX "newsletters__status_idx" ON "newsletters" USING btree ("_status");
  CREATE INDEX "newsletters_texts_order_parent" ON "newsletters_texts" USING btree ("order","parent_id");
  CREATE INDEX "_newsletters_v_blocks_hero_actions_order_idx" ON "_newsletters_v_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_hero_actions_parent_id_idx" ON "_newsletters_v_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_hero_order_idx" ON "_newsletters_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_hero_parent_id_idx" ON "_newsletters_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_hero_path_idx" ON "_newsletters_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_hero_image_image_src_idx" ON "_newsletters_v_blocks_hero" USING btree ("image_src_id");
  CREATE INDEX "_newsletters_v_blocks_callout_order_idx" ON "_newsletters_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_callout_parent_id_idx" ON "_newsletters_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_callout_path_idx" ON "_newsletters_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_features_items_order_idx" ON "_newsletters_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_features_items_parent_id_idx" ON "_newsletters_v_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_features_order_idx" ON "_newsletters_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_features_parent_id_idx" ON "_newsletters_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_features_path_idx" ON "_newsletters_v_blocks_features" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_stats_stats_order_idx" ON "_newsletters_v_blocks_stats_stats" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_stats_stats_parent_id_idx" ON "_newsletters_v_blocks_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_stats_order_idx" ON "_newsletters_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_stats_parent_id_idx" ON "_newsletters_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_stats_path_idx" ON "_newsletters_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_cta_actions_order_idx" ON "_newsletters_v_blocks_cta_actions" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_cta_actions_parent_id_idx" ON "_newsletters_v_blocks_cta_actions" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_cta_order_idx" ON "_newsletters_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_cta_parent_id_idx" ON "_newsletters_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_cta_path_idx" ON "_newsletters_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_content_order_idx" ON "_newsletters_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_content_parent_id_idx" ON "_newsletters_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_content_path_idx" ON "_newsletters_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_testimonial_testimonials_order_idx" ON "_newsletters_v_blocks_testimonial_testimonials" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_testimonial_testimonials_parent_id_idx" ON "_newsletters_v_blocks_testimonial_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_testimonial_testimonials_avatar_idx" ON "_newsletters_v_blocks_testimonial_testimonials" USING btree ("avatar_id");
  CREATE INDEX "_newsletters_v_blocks_testimonial_order_idx" ON "_newsletters_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_testimonial_parent_id_idx" ON "_newsletters_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_testimonial_path_idx" ON "_newsletters_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_video_order_idx" ON "_newsletters_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_video_parent_id_idx" ON "_newsletters_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_video_path_idx" ON "_newsletters_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_image_text_order_idx" ON "_newsletters_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_image_text_parent_id_idx" ON "_newsletters_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_image_text_path_idx" ON "_newsletters_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_image_text_image_image_src_idx" ON "_newsletters_v_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "_newsletters_v_parent_idx" ON "_newsletters_v" USING btree ("parent_id");
  CREATE INDEX "_newsletters_v_version_version_tenant_idx" ON "_newsletters_v" USING btree ("version_tenant_id");
  CREATE INDEX "_newsletters_v_version_version_slug_idx" ON "_newsletters_v" USING btree ("version_slug");
  CREATE INDEX "_newsletters_v_version_version_author_idx" ON "_newsletters_v" USING btree ("version_author_id");
  CREATE INDEX "_newsletters_v_version_version_featured_image_idx" ON "_newsletters_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_newsletters_v_version_version_legacy_id_idx" ON "_newsletters_v" USING btree ("version_legacy_id");
  CREATE INDEX "_newsletters_v_version_version_updated_at_idx" ON "_newsletters_v" USING btree ("version_updated_at");
  CREATE INDEX "_newsletters_v_version_version_created_at_idx" ON "_newsletters_v" USING btree ("version_created_at");
  CREATE INDEX "_newsletters_v_version_version__status_idx" ON "_newsletters_v" USING btree ("version__status");
  CREATE INDEX "_newsletters_v_created_at_idx" ON "_newsletters_v" USING btree ("created_at");
  CREATE INDEX "_newsletters_v_updated_at_idx" ON "_newsletters_v" USING btree ("updated_at");
  CREATE INDEX "_newsletters_v_snapshot_idx" ON "_newsletters_v" USING btree ("snapshot");
  CREATE INDEX "_newsletters_v_published_locale_idx" ON "_newsletters_v" USING btree ("published_locale");
  CREATE INDEX "_newsletters_v_latest_idx" ON "_newsletters_v" USING btree ("latest");
  CREATE INDEX "_newsletters_v_texts_order_parent" ON "_newsletters_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "vacancies_tenant_idx" ON "vacancies" USING btree ("tenant_id");
  CREATE INDEX "vacancies_slug_idx" ON "vacancies" USING btree ("slug");
  CREATE INDEX "vacancies_supporting_document_idx" ON "vacancies" USING btree ("supporting_document_id");
  CREATE INDEX "vacancies_legacy_id_idx" ON "vacancies" USING btree ("legacy_id");
  CREATE INDEX "vacancies_updated_at_idx" ON "vacancies" USING btree ("updated_at");
  CREATE INDEX "vacancies_created_at_idx" ON "vacancies" USING btree ("created_at");
  CREATE INDEX "vacancies_texts_order_parent" ON "vacancies_texts" USING btree ("order","parent_id");
  CREATE INDEX "speakers_tenant_idx" ON "speakers" USING btree ("tenant_id");
  CREATE INDEX "speakers_avatar_idx" ON "speakers" USING btree ("avatar_id");
  CREATE INDEX "speakers_legacy_id_idx" ON "speakers" USING btree ("legacy_id");
  CREATE INDEX "speakers_updated_at_idx" ON "speakers" USING btree ("updated_at");
  CREATE INDEX "speakers_created_at_idx" ON "speakers" USING btree ("created_at");
  CREATE INDEX "authors_tenant_idx" ON "authors" USING btree ("tenant_id");
  CREATE INDEX "authors_avatar_idx" ON "authors" USING btree ("avatar_id");
  CREATE INDEX "authors_legacy_id_idx" ON "authors" USING btree ("legacy_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "tags_tenant_idx" ON "tags" USING btree ("tenant_id");
  CREATE INDEX "tags_legacy_id_idx" ON "tags" USING btree ("legacy_id");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
  CREATE INDEX "media_legacy_path_idx" ON "media" USING btree ("legacy_path");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "redirects_tenant_idx" ON "redirects" USING btree ("tenant_id");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "site_settings_header_nav_submenu_order_idx" ON "site_settings_header_nav_submenu" USING btree ("_order");
  CREATE INDEX "site_settings_header_nav_submenu_parent_id_idx" ON "site_settings_header_nav_submenu" USING btree ("_parent_id");
  CREATE INDEX "site_settings_header_nav_submenu_page_idx" ON "site_settings_header_nav_submenu" USING btree ("page_id");
  CREATE UNIQUE INDEX "site_settings_header_nav_submenu_locales_locale_parent_id_un" ON "site_settings_header_nav_submenu_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_header_nav_order_idx" ON "site_settings_header_nav" USING btree ("_order");
  CREATE INDEX "site_settings_header_nav_parent_id_idx" ON "site_settings_header_nav" USING btree ("_parent_id");
  CREATE INDEX "site_settings_header_nav_page_idx" ON "site_settings_header_nav" USING btree ("page_id");
  CREATE UNIQUE INDEX "site_settings_header_nav_locales_locale_parent_id_unique" ON "site_settings_header_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_footer_social_order_idx" ON "site_settings_footer_social" USING btree ("_order");
  CREATE INDEX "site_settings_footer_social_parent_id_idx" ON "site_settings_footer_social" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_quick_links_links_order_idx" ON "site_settings_footer_quick_links_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_quick_links_links_parent_id_idx" ON "site_settings_footer_quick_links_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_quick_links_links_page_idx" ON "site_settings_footer_quick_links_links" USING btree ("page_id");
  CREATE INDEX "site_settings_footer_quick_links_order_idx" ON "site_settings_footer_quick_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_quick_links_parent_id_idx" ON "site_settings_footer_quick_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_tenant_idx" ON "site_settings" USING btree ("tenant_id");
  CREATE INDEX "site_settings_header_header_logo_idx" ON "site_settings" USING btree ("header_logo_id");
  CREATE INDEX "site_settings_updated_at_idx" ON "site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "site_settings" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_roles_order_idx" ON "users_tenants_roles" USING btree ("order");
  CREATE INDEX "users_tenants_roles_parent_idx" ON "users_tenants_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_past_events_id_idx" ON "payload_locked_documents_rels" USING btree ("past_events_id");
  CREATE INDEX "payload_locked_documents_rels_newsletters_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletters_id");
  CREATE INDEX "payload_locked_documents_rels_vacancies_id_idx" ON "payload_locked_documents_rels" USING btree ("vacancies_id");
  CREATE INDEX "payload_locked_documents_rels_speakers_id_idx" ON "payload_locked_documents_rels" USING btree ("speakers_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_site_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("site_settings_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_actions" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_events_calendar_preview" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_blocks_features_items" CASCADE;
  DROP TABLE "pages_blocks_features" CASCADE;
  DROP TABLE "pages_blocks_stats_stats" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_cta_actions" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_testimonial_testimonials" CASCADE;
  DROP TABLE "pages_blocks_testimonial" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_image_text" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_events_calendar_preview" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_features_items" CASCADE;
  DROP TABLE "_pages_v_blocks_features" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_image_text" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "events_speakers" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "past_events_blocks_hero_actions" CASCADE;
  DROP TABLE "past_events_blocks_hero" CASCADE;
  DROP TABLE "past_events_blocks_callout" CASCADE;
  DROP TABLE "past_events_blocks_features_items" CASCADE;
  DROP TABLE "past_events_blocks_features" CASCADE;
  DROP TABLE "past_events_blocks_stats_stats" CASCADE;
  DROP TABLE "past_events_blocks_stats" CASCADE;
  DROP TABLE "past_events_blocks_cta_actions" CASCADE;
  DROP TABLE "past_events_blocks_cta" CASCADE;
  DROP TABLE "past_events_blocks_content" CASCADE;
  DROP TABLE "past_events_blocks_testimonial_testimonials" CASCADE;
  DROP TABLE "past_events_blocks_testimonial" CASCADE;
  DROP TABLE "past_events_blocks_video" CASCADE;
  DROP TABLE "past_events_blocks_image_text" CASCADE;
  DROP TABLE "past_events" CASCADE;
  DROP TABLE "past_events_rels" CASCADE;
  DROP TABLE "_past_events_v_blocks_hero_actions" CASCADE;
  DROP TABLE "_past_events_v_blocks_hero" CASCADE;
  DROP TABLE "_past_events_v_blocks_callout" CASCADE;
  DROP TABLE "_past_events_v_blocks_features_items" CASCADE;
  DROP TABLE "_past_events_v_blocks_features" CASCADE;
  DROP TABLE "_past_events_v_blocks_stats_stats" CASCADE;
  DROP TABLE "_past_events_v_blocks_stats" CASCADE;
  DROP TABLE "_past_events_v_blocks_cta_actions" CASCADE;
  DROP TABLE "_past_events_v_blocks_cta" CASCADE;
  DROP TABLE "_past_events_v_blocks_content" CASCADE;
  DROP TABLE "_past_events_v_blocks_testimonial_testimonials" CASCADE;
  DROP TABLE "_past_events_v_blocks_testimonial" CASCADE;
  DROP TABLE "_past_events_v_blocks_video" CASCADE;
  DROP TABLE "_past_events_v_blocks_image_text" CASCADE;
  DROP TABLE "_past_events_v" CASCADE;
  DROP TABLE "_past_events_v_rels" CASCADE;
  DROP TABLE "newsletters_blocks_hero_actions" CASCADE;
  DROP TABLE "newsletters_blocks_hero" CASCADE;
  DROP TABLE "newsletters_blocks_callout" CASCADE;
  DROP TABLE "newsletters_blocks_features_items" CASCADE;
  DROP TABLE "newsletters_blocks_features" CASCADE;
  DROP TABLE "newsletters_blocks_stats_stats" CASCADE;
  DROP TABLE "newsletters_blocks_stats" CASCADE;
  DROP TABLE "newsletters_blocks_cta_actions" CASCADE;
  DROP TABLE "newsletters_blocks_cta" CASCADE;
  DROP TABLE "newsletters_blocks_content" CASCADE;
  DROP TABLE "newsletters_blocks_testimonial_testimonials" CASCADE;
  DROP TABLE "newsletters_blocks_testimonial" CASCADE;
  DROP TABLE "newsletters_blocks_video" CASCADE;
  DROP TABLE "newsletters_blocks_image_text" CASCADE;
  DROP TABLE "newsletters" CASCADE;
  DROP TABLE "newsletters_texts" CASCADE;
  DROP TABLE "_newsletters_v_blocks_hero_actions" CASCADE;
  DROP TABLE "_newsletters_v_blocks_hero" CASCADE;
  DROP TABLE "_newsletters_v_blocks_callout" CASCADE;
  DROP TABLE "_newsletters_v_blocks_features_items" CASCADE;
  DROP TABLE "_newsletters_v_blocks_features" CASCADE;
  DROP TABLE "_newsletters_v_blocks_stats_stats" CASCADE;
  DROP TABLE "_newsletters_v_blocks_stats" CASCADE;
  DROP TABLE "_newsletters_v_blocks_cta_actions" CASCADE;
  DROP TABLE "_newsletters_v_blocks_cta" CASCADE;
  DROP TABLE "_newsletters_v_blocks_content" CASCADE;
  DROP TABLE "_newsletters_v_blocks_testimonial_testimonials" CASCADE;
  DROP TABLE "_newsletters_v_blocks_testimonial" CASCADE;
  DROP TABLE "_newsletters_v_blocks_video" CASCADE;
  DROP TABLE "_newsletters_v_blocks_image_text" CASCADE;
  DROP TABLE "_newsletters_v" CASCADE;
  DROP TABLE "_newsletters_v_texts" CASCADE;
  DROP TABLE "vacancies" CASCADE;
  DROP TABLE "vacancies_texts" CASCADE;
  DROP TABLE "speakers" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "site_settings_header_nav_submenu" CASCADE;
  DROP TABLE "site_settings_header_nav_submenu_locales" CASCADE;
  DROP TABLE "site_settings_header_nav" CASCADE;
  DROP TABLE "site_settings_header_nav_locales" CASCADE;
  DROP TABLE "site_settings_footer_social" CASCADE;
  DROP TABLE "site_settings_footer_quick_links_links" CASCADE;
  DROP TABLE "site_settings_footer_quick_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_tenants_roles" CASCADE;
  DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_blocks_hero_actions_type";
  DROP TYPE "public"."enum_pages_blocks_cta_actions_type";
  DROP TYPE "public"."enum_pages_blocks_video_color";
  DROP TYPE "public"."enum_pages_blocks_image_text_layout";
  DROP TYPE "public"."enum_pages_blocks_image_text_image_size";
  DROP TYPE "public"."enum_pages_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_actions_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_actions_type";
  DROP TYPE "public"."enum__pages_v_blocks_video_color";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_layout";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_image_size";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_events_language";
  DROP TYPE "public"."enum_events_event_type";
  DROP TYPE "public"."enum_past_events_blocks_hero_actions_type";
  DROP TYPE "public"."enum_past_events_blocks_cta_actions_type";
  DROP TYPE "public"."enum_past_events_blocks_video_color";
  DROP TYPE "public"."enum_past_events_blocks_image_text_layout";
  DROP TYPE "public"."enum_past_events_blocks_image_text_image_size";
  DROP TYPE "public"."enum_past_events_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum_past_events_language";
  DROP TYPE "public"."enum_past_events_status";
  DROP TYPE "public"."enum__past_events_v_blocks_hero_actions_type";
  DROP TYPE "public"."enum__past_events_v_blocks_cta_actions_type";
  DROP TYPE "public"."enum__past_events_v_blocks_video_color";
  DROP TYPE "public"."enum__past_events_v_blocks_image_text_layout";
  DROP TYPE "public"."enum__past_events_v_blocks_image_text_image_size";
  DROP TYPE "public"."enum__past_events_v_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum__past_events_v_version_language";
  DROP TYPE "public"."enum__past_events_v_version_status";
  DROP TYPE "public"."enum__past_events_v_published_locale";
  DROP TYPE "public"."enum_newsletters_blocks_hero_actions_type";
  DROP TYPE "public"."enum_newsletters_blocks_cta_actions_type";
  DROP TYPE "public"."enum_newsletters_blocks_video_color";
  DROP TYPE "public"."enum_newsletters_blocks_image_text_layout";
  DROP TYPE "public"."enum_newsletters_blocks_image_text_image_size";
  DROP TYPE "public"."enum_newsletters_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum_newsletters_language";
  DROP TYPE "public"."enum_newsletters_type";
  DROP TYPE "public"."enum_newsletters_organization";
  DROP TYPE "public"."enum_newsletters_status";
  DROP TYPE "public"."enum__newsletters_v_blocks_hero_actions_type";
  DROP TYPE "public"."enum__newsletters_v_blocks_cta_actions_type";
  DROP TYPE "public"."enum__newsletters_v_blocks_video_color";
  DROP TYPE "public"."enum__newsletters_v_blocks_image_text_layout";
  DROP TYPE "public"."enum__newsletters_v_blocks_image_text_image_size";
  DROP TYPE "public"."enum__newsletters_v_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum__newsletters_v_version_language";
  DROP TYPE "public"."enum__newsletters_v_version_type";
  DROP TYPE "public"."enum__newsletters_v_version_organization";
  DROP TYPE "public"."enum__newsletters_v_version_status";
  DROP TYPE "public"."enum__newsletters_v_published_locale";
  DROP TYPE "public"."enum_vacancies_language";
  DROP TYPE "public"."enum_vacancies_opportunity_type";
  DROP TYPE "public"."enum_vacancies_location_type";
  DROP TYPE "public"."enum_site_settings_header_color";
  DROP TYPE "public"."enum_site_settings_theme_font";
  DROP TYPE "public"."enum_site_settings_theme_dark_mode";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_tenants_roles";`)
}
