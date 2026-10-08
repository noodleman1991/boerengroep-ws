import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_pages_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_pages_blocks_hero_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_hero_layout" AS ENUM('split', 'centered');
  CREATE TYPE "public"."enum_pages_blocks_events_calendar_preview_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_events_calendar_preview_mode" AS ENUM('upcoming', 'type', 'picked');
  CREATE TYPE "public"."enum_pages_blocks_events_calendar_preview_event_type" AS ENUM('talk', 'workshop', 'lecture', 'meeting', 'board-meeting', 'soup-kitchen', 'csa', 'excursion');
  CREATE TYPE "public"."enum_pages_blocks_callout_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_features_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_stats_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_pages_blocks_content_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_content_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum_pages_blocks_testimonial_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_video_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum_pages_blocks_image_text_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum_pages_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_pages_blocks_gallery_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_gallery_source" AS ENUM('pictures', 'pastEvent');
  CREATE TYPE "public"."enum_pages_blocks_documents_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_podcast_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_podcast_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_signup_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_form_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_item_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_item_action_type" AS ENUM('link', 'form');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_layout" AS ENUM('split', 'centered');
  CREATE TYPE "public"."enum__pages_v_blocks_events_calendar_preview_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_events_calendar_preview_mode" AS ENUM('upcoming', 'type', 'picked');
  CREATE TYPE "public"."enum__pages_v_blocks_events_calendar_preview_event_type" AS ENUM('talk', 'workshop', 'lecture', 'meeting', 'board-meeting', 'soup-kitchen', 'csa', 'excursion');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_features_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_content_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_content_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonial_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_video_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_source" AS ENUM('pictures', 'pastEvent');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_podcast_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_podcast_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_signup_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_form_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_item_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_item_action_type" AS ENUM('link', 'form');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_events_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_events_status" AS ENUM('scheduled', 'full', 'cancelled', 'postponed');
  CREATE TYPE "public"."enum_events_event_type" AS ENUM('talk', 'workshop', 'lecture', 'meeting', 'board-meeting', 'soup-kitchen', 'csa', 'excursion');
  CREATE TYPE "public"."enum_past_events_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_past_events_blocks_hero_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_hero_layout" AS ENUM('split', 'centered');
  CREATE TYPE "public"."enum_past_events_blocks_callout_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_features_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_stats_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_past_events_blocks_content_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_content_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum_past_events_blocks_testimonial_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_video_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum_past_events_blocks_image_text_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum_past_events_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_past_events_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_past_events_blocks_gallery_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_gallery_source" AS ENUM('pictures', 'pastEvent');
  CREATE TYPE "public"."enum_past_events_blocks_documents_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_podcast_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_podcast_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum_past_events_blocks_form_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_item_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_item_action_type" AS ENUM('link', 'form');
  CREATE TYPE "public"."enum_past_events_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_past_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__past_events_v_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__past_events_v_blocks_hero_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_hero_layout" AS ENUM('split', 'centered');
  CREATE TYPE "public"."enum__past_events_v_blocks_callout_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_features_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_stats_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__past_events_v_blocks_content_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_content_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum__past_events_v_blocks_testimonial_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_video_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum__past_events_v_blocks_image_text_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum__past_events_v_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__past_events_v_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__past_events_v_blocks_gallery_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_gallery_source" AS ENUM('pictures', 'pastEvent');
  CREATE TYPE "public"."enum__past_events_v_blocks_documents_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_podcast_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_podcast_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum__past_events_v_blocks_form_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_item_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_item_action_type" AS ENUM('link', 'form');
  CREATE TYPE "public"."enum__past_events_v_version_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum__past_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__past_events_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_newsletters_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_newsletters_blocks_hero_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_hero_layout" AS ENUM('split', 'centered');
  CREATE TYPE "public"."enum_newsletters_blocks_callout_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_features_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_stats_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum_newsletters_blocks_content_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_content_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum_newsletters_blocks_testimonial_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_video_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum_newsletters_blocks_image_text_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum_newsletters_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_newsletters_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_newsletters_blocks_gallery_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_gallery_source" AS ENUM('pictures', 'pastEvent');
  CREATE TYPE "public"."enum_newsletters_blocks_documents_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_podcast_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_podcast_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum_newsletters_blocks_form_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_item_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_item_action_type" AS ENUM('link', 'form');
  CREATE TYPE "public"."enum_newsletters_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_newsletters_type" AS ENUM('article', 'link', 'event', 'update');
  CREATE TYPE "public"."enum_newsletters_organization" AS ENUM('Boerengroep', 'Inspringtheater', 'friends');
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__newsletters_v_blocks_hero_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__newsletters_v_blocks_hero_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_hero_layout" AS ENUM('split', 'centered');
  CREATE TYPE "public"."enum__newsletters_v_blocks_callout_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_features_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_stats_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_cta_actions_type" AS ENUM('button', 'link');
  CREATE TYPE "public"."enum__newsletters_v_blocks_content_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_content_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum__newsletters_v_blocks_testimonial_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_video_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_video_color" AS ENUM('default', 'tint', 'primary');
  CREATE TYPE "public"."enum__newsletters_v_blocks_image_text_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_image_text_layout" AS ENUM('image-left', 'image-right', 'image-center', 'text-above-center', 'text-below-center');
  CREATE TYPE "public"."enum__newsletters_v_blocks_image_text_image_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__newsletters_v_blocks_image_text_vertical_alignment" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__newsletters_v_blocks_gallery_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_gallery_source" AS ENUM('pictures', 'pastEvent');
  CREATE TYPE "public"."enum__newsletters_v_blocks_documents_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_podcast_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_podcast_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum__newsletters_v_blocks_form_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_item_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_item_action_type" AS ENUM('link', 'form');
  CREATE TYPE "public"."enum__newsletters_v_version_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum__newsletters_v_version_type" AS ENUM('article', 'link', 'event', 'update');
  CREATE TYPE "public"."enum__newsletters_v_version_organization" AS ENUM('Boerengroep', 'Inspringtheater', 'friends');
  CREATE TYPE "public"."enum__newsletters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__newsletters_v_published_locale" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_vacancies_language" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_vacancies_opportunity_type" AS ENUM('volunteer', 'internship', 'coordinator', 'board', 'other');
  CREATE TYPE "public"."enum_vacancies_location_type" AS ENUM('remote', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_site_settings_general_social_platform" AS ENUM('instagram', 'facebook', 'linkedin', 'youtube', 'mastodon', 'bluesky', 'x', 'chat', 'other');
  CREATE TYPE "public"."enum_site_settings_header_nav_children_link_type" AS ENUM('page', 'section', 'custom');
  CREATE TYPE "public"."enum_site_settings_header_nav_children_section" AS ENUM('home', 'calendar', 'past-events', 'news', 'newsletter', 'friends-news', 'podcast', 'vacancies');
  CREATE TYPE "public"."enum_site_settings_header_nav_link_type" AS ENUM('page', 'section', 'custom');
  CREATE TYPE "public"."enum_site_settings_header_nav_section" AS ENUM('home', 'calendar', 'past-events', 'news', 'newsletter', 'friends-news', 'podcast', 'vacancies');
  CREATE TYPE "public"."enum_site_settings_footer_columns_links_link_type" AS ENUM('page', 'section', 'custom');
  CREATE TYPE "public"."enum_site_settings_footer_columns_links_section" AS ENUM('home', 'calendar', 'past-events', 'news', 'newsletter', 'friends-news', 'podcast', 'vacancies');
  CREATE TYPE "public"."enum_site_settings_footer_legal_links_link_type" AS ENUM('page', 'section', 'custom');
  CREATE TYPE "public"."enum_site_settings_footer_legal_links_section" AS ENUM('home', 'calendar', 'past-events', 'news', 'newsletter', 'friends-news', 'podcast', 'vacancies');
  CREATE TYPE "public"."enum_site_settings_calendar_default_view" AS ENUM('list', 'month');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('super-admin', 'user');
  CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('tenant-admin', 'editor');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
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
  	"background" "enum_pages_blocks_hero_background" DEFAULT 'white',
  	"layout" "enum_pages_blocks_hero_layout" DEFAULT 'split',
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
  	"background" "enum_pages_blocks_events_calendar_preview_background" DEFAULT 'white',
  	"title" varchar,
  	"description" varchar,
  	"mode" "enum_pages_blocks_events_calendar_preview_mode" DEFAULT 'upcoming',
  	"event_type" "enum_pages_blocks_events_calendar_preview_event_type",
  	"count" numeric DEFAULT 4,
  	"show_mini_calendar" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_callout_background" DEFAULT 'white',
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
  	"background" "enum_pages_blocks_features_background" DEFAULT 'white',
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
  	"background" "enum_pages_blocks_stats_background" DEFAULT 'white',
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
  	"background" "enum_pages_blocks_content_background" DEFAULT 'white',
  	"width" "enum_pages_blocks_content_width" DEFAULT 'normal',
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
  	"background" "enum_pages_blocks_testimonial_background" DEFAULT 'white',
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
  	"background" "enum_pages_blocks_video_background" DEFAULT 'white',
  	"color" "enum_pages_blocks_video_color",
  	"url" varchar,
  	"caption" varchar,
  	"poster_id" integer,
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
  	"background" "enum_pages_blocks_image_text_background" DEFAULT 'white',
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum_pages_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum_pages_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum_pages_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_gallery_background" DEFAULT 'white',
  	"title" varchar,
  	"source" "enum_pages_blocks_gallery_source" DEFAULT 'pictures',
  	"past_event_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_documents_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_documents_background" DEFAULT 'white',
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_podcast_episodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"match" varchar
  );
  
  CREATE TABLE "pages_blocks_podcast" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_podcast_background" DEFAULT 'white',
  	"title" varchar,
  	"mode" "enum_pages_blocks_podcast_mode" DEFAULT 'latest',
  	"count" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_newsletter_signup_background" DEFAULT 'white',
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_form_background" DEFAULT 'white',
  	"title" varchar,
  	"intro" jsonb,
  	"form_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_item_background" DEFAULT 'white',
  	"title" varchar,
  	"details" jsonb,
  	"price_text" varchar,
  	"action_type" "enum_pages_blocks_item_action_type" DEFAULT 'link',
  	"button_label" varchar,
  	"link_url" varchar,
  	"form_id" integer,
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
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"events_id" integer,
  	"media_id" integer
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
  	"background" "enum__pages_v_blocks_hero_background" DEFAULT 'white',
  	"layout" "enum__pages_v_blocks_hero_layout" DEFAULT 'split',
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
  	"background" "enum__pages_v_blocks_events_calendar_preview_background" DEFAULT 'white',
  	"title" varchar,
  	"description" varchar,
  	"mode" "enum__pages_v_blocks_events_calendar_preview_mode" DEFAULT 'upcoming',
  	"event_type" "enum__pages_v_blocks_events_calendar_preview_event_type",
  	"count" numeric DEFAULT 4,
  	"show_mini_calendar" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_callout_background" DEFAULT 'white',
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
  	"background" "enum__pages_v_blocks_features_background" DEFAULT 'white',
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
  	"background" "enum__pages_v_blocks_stats_background" DEFAULT 'white',
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
  	"background" "enum__pages_v_blocks_content_background" DEFAULT 'white',
  	"width" "enum__pages_v_blocks_content_width" DEFAULT 'normal',
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
  	"background" "enum__pages_v_blocks_testimonial_background" DEFAULT 'white',
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
  	"background" "enum__pages_v_blocks_video_background" DEFAULT 'white',
  	"color" "enum__pages_v_blocks_video_color",
  	"url" varchar,
  	"caption" varchar,
  	"poster_id" integer,
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
  	"background" "enum__pages_v_blocks_image_text_background" DEFAULT 'white',
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum__pages_v_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum__pages_v_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum__pages_v_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_gallery_background" DEFAULT 'white',
  	"title" varchar,
  	"source" "enum__pages_v_blocks_gallery_source" DEFAULT 'pictures',
  	"past_event_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_documents_background" DEFAULT 'white',
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_podcast_episodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"match" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_podcast" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_podcast_background" DEFAULT 'white',
  	"title" varchar,
  	"mode" "enum__pages_v_blocks_podcast_mode" DEFAULT 'latest',
  	"count" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_newsletter_signup_background" DEFAULT 'white',
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_form_background" DEFAULT 'white',
  	"title" varchar,
  	"intro" jsonb,
  	"form_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_item_background" DEFAULT 'white',
  	"title" varchar,
  	"details" jsonb,
  	"price_text" varchar,
  	"action_type" "enum__pages_v_blocks_item_action_type" DEFAULT 'link',
  	"button_label" varchar,
  	"link_url" varchar,
  	"form_id" integer,
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
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"events_id" integer,
  	"media_id" integer
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
  	"slug" varchar,
  	"language" "enum_events_language",
  	"status" "enum_events_status" DEFAULT 'scheduled' NOT NULL,
  	"status_note" varchar,
  	"description" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"event_type" "enum_events_event_type" NOT NULL,
  	"location_address" varchar,
  	"location_maps_link" varchar,
  	"location_call_link" varchar,
  	"image_id" integer,
  	"registration_link" jsonb,
  	"featured" boolean,
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
  	"background" "enum_past_events_blocks_hero_background" DEFAULT 'white',
  	"layout" "enum_past_events_blocks_hero_layout" DEFAULT 'split',
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
  	"background" "enum_past_events_blocks_callout_background" DEFAULT 'white',
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
  	"background" "enum_past_events_blocks_features_background" DEFAULT 'white',
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
  	"background" "enum_past_events_blocks_stats_background" DEFAULT 'white',
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
  	"background" "enum_past_events_blocks_content_background" DEFAULT 'white',
  	"width" "enum_past_events_blocks_content_width" DEFAULT 'normal',
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
  	"background" "enum_past_events_blocks_testimonial_background" DEFAULT 'white',
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_past_events_blocks_video_background" DEFAULT 'white',
  	"color" "enum_past_events_blocks_video_color",
  	"url" varchar,
  	"caption" varchar,
  	"poster_id" integer,
  	"auto_play" boolean,
  	"loop" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_past_events_blocks_image_text_background" DEFAULT 'white',
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum_past_events_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum_past_events_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum_past_events_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_past_events_blocks_gallery_background" DEFAULT 'white',
  	"title" varchar,
  	"source" "enum_past_events_blocks_gallery_source" DEFAULT 'pictures',
  	"past_event_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_documents_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer
  );
  
  CREATE TABLE "past_events_blocks_documents_files_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "past_events_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_past_events_blocks_documents_background" DEFAULT 'white',
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_podcast_episodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"match" varchar
  );
  
  CREATE TABLE "past_events_blocks_podcast" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_past_events_blocks_podcast_background" DEFAULT 'white',
  	"title" varchar,
  	"mode" "enum_past_events_blocks_podcast_mode" DEFAULT 'latest',
  	"count" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_past_events_blocks_form_background" DEFAULT 'white',
  	"title" varchar,
  	"intro" jsonb,
  	"form_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "past_events_blocks_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_past_events_blocks_item_background" DEFAULT 'white',
  	"title" varchar,
  	"details" jsonb,
  	"price_text" varchar,
  	"action_type" "enum_past_events_blocks_item_action_type" DEFAULT 'link',
  	"button_label" varchar,
  	"link_url" varchar,
  	"form_id" integer,
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
  	"tags_id" integer,
  	"media_id" integer
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
  	"background" "enum__past_events_v_blocks_hero_background" DEFAULT 'white',
  	"layout" "enum__past_events_v_blocks_hero_layout" DEFAULT 'split',
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
  	"background" "enum__past_events_v_blocks_callout_background" DEFAULT 'white',
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
  	"background" "enum__past_events_v_blocks_features_background" DEFAULT 'white',
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
  	"background" "enum__past_events_v_blocks_stats_background" DEFAULT 'white',
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
  	"background" "enum__past_events_v_blocks_content_background" DEFAULT 'white',
  	"width" "enum__past_events_v_blocks_content_width" DEFAULT 'normal',
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
  	"background" "enum__past_events_v_blocks_testimonial_background" DEFAULT 'white',
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
  	"background" "enum__past_events_v_blocks_video_background" DEFAULT 'white',
  	"color" "enum__past_events_v_blocks_video_color",
  	"url" varchar,
  	"caption" varchar,
  	"poster_id" integer,
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
  	"background" "enum__past_events_v_blocks_image_text_background" DEFAULT 'white',
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum__past_events_v_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum__past_events_v_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum__past_events_v_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__past_events_v_blocks_gallery_background" DEFAULT 'white',
  	"title" varchar,
  	"source" "enum__past_events_v_blocks_gallery_source" DEFAULT 'pictures',
  	"past_event_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_documents_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_documents_files_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_past_events_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__past_events_v_blocks_documents_background" DEFAULT 'white',
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_podcast_episodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"match" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_podcast" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__past_events_v_blocks_podcast_background" DEFAULT 'white',
  	"title" varchar,
  	"mode" "enum__past_events_v_blocks_podcast_mode" DEFAULT 'latest',
  	"count" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__past_events_v_blocks_form_background" DEFAULT 'white',
  	"title" varchar,
  	"intro" jsonb,
  	"form_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_past_events_v_blocks_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__past_events_v_blocks_item_background" DEFAULT 'white',
  	"title" varchar,
  	"details" jsonb,
  	"price_text" varchar,
  	"action_type" "enum__past_events_v_blocks_item_action_type" DEFAULT 'link',
  	"button_label" varchar,
  	"link_url" varchar,
  	"form_id" integer,
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
  	"tags_id" integer,
  	"media_id" integer
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
  	"background" "enum_newsletters_blocks_hero_background" DEFAULT 'white',
  	"layout" "enum_newsletters_blocks_hero_layout" DEFAULT 'split',
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
  	"background" "enum_newsletters_blocks_callout_background" DEFAULT 'white',
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
  	"background" "enum_newsletters_blocks_features_background" DEFAULT 'white',
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
  	"background" "enum_newsletters_blocks_stats_background" DEFAULT 'white',
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
  	"background" "enum_newsletters_blocks_content_background" DEFAULT 'white',
  	"width" "enum_newsletters_blocks_content_width" DEFAULT 'normal',
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
  	"background" "enum_newsletters_blocks_testimonial_background" DEFAULT 'white',
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_newsletters_blocks_video_background" DEFAULT 'white',
  	"color" "enum_newsletters_blocks_video_color",
  	"url" varchar,
  	"caption" varchar,
  	"poster_id" integer,
  	"auto_play" boolean,
  	"loop" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_newsletters_blocks_image_text_background" DEFAULT 'white',
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum_newsletters_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum_newsletters_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum_newsletters_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_newsletters_blocks_gallery_background" DEFAULT 'white',
  	"title" varchar,
  	"source" "enum_newsletters_blocks_gallery_source" DEFAULT 'pictures',
  	"past_event_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_documents_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer
  );
  
  CREATE TABLE "newsletters_blocks_documents_files_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "newsletters_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_newsletters_blocks_documents_background" DEFAULT 'white',
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_podcast_episodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"match" varchar
  );
  
  CREATE TABLE "newsletters_blocks_podcast" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_newsletters_blocks_podcast_background" DEFAULT 'white',
  	"title" varchar,
  	"mode" "enum_newsletters_blocks_podcast_mode" DEFAULT 'latest',
  	"count" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_newsletters_blocks_form_background" DEFAULT 'white',
  	"title" varchar,
  	"intro" jsonb,
  	"form_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_newsletters_blocks_item_background" DEFAULT 'white',
  	"title" varchar,
  	"details" jsonb,
  	"price_text" varchar,
  	"action_type" "enum_newsletters_blocks_item_action_type" DEFAULT 'link',
  	"button_label" varchar,
  	"link_url" varchar,
  	"form_id" integer,
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
  
  CREATE TABLE "newsletters_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
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
  	"background" "enum__newsletters_v_blocks_hero_background" DEFAULT 'white',
  	"layout" "enum__newsletters_v_blocks_hero_layout" DEFAULT 'split',
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
  	"background" "enum__newsletters_v_blocks_callout_background" DEFAULT 'white',
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
  	"background" "enum__newsletters_v_blocks_features_background" DEFAULT 'white',
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
  	"background" "enum__newsletters_v_blocks_stats_background" DEFAULT 'white',
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
  	"background" "enum__newsletters_v_blocks_content_background" DEFAULT 'white',
  	"width" "enum__newsletters_v_blocks_content_width" DEFAULT 'normal',
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
  	"background" "enum__newsletters_v_blocks_testimonial_background" DEFAULT 'white',
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
  	"background" "enum__newsletters_v_blocks_video_background" DEFAULT 'white',
  	"color" "enum__newsletters_v_blocks_video_color",
  	"url" varchar,
  	"caption" varchar,
  	"poster_id" integer,
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
  	"background" "enum__newsletters_v_blocks_image_text_background" DEFAULT 'white',
  	"image_src_id" integer,
  	"image_alt" varchar,
  	"content" jsonb,
  	"layout" "enum__newsletters_v_blocks_image_text_layout" DEFAULT 'image-left',
  	"image_size" "enum__newsletters_v_blocks_image_text_image_size" DEFAULT 'medium',
  	"vertical_alignment" "enum__newsletters_v_blocks_image_text_vertical_alignment" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__newsletters_v_blocks_gallery_background" DEFAULT 'white',
  	"title" varchar,
  	"source" "enum__newsletters_v_blocks_gallery_source" DEFAULT 'pictures',
  	"past_event_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_documents_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_documents_files_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_newsletters_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__newsletters_v_blocks_documents_background" DEFAULT 'white',
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_podcast_episodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"match" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_podcast" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__newsletters_v_blocks_podcast_background" DEFAULT 'white',
  	"title" varchar,
  	"mode" "enum__newsletters_v_blocks_podcast_mode" DEFAULT 'latest',
  	"count" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__newsletters_v_blocks_form_background" DEFAULT 'white',
  	"title" varchar,
  	"intro" jsonb,
  	"form_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__newsletters_v_blocks_item_background" DEFAULT 'white',
  	"title" varchar,
  	"details" jsonb,
  	"price_text" varchar,
  	"action_type" "enum__newsletters_v_blocks_item_action_type" DEFAULT 'link',
  	"button_label" varchar,
  	"link_url" varchar,
  	"form_id" integer,
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
  
  CREATE TABLE "_newsletters_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
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
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
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
  
  CREATE TABLE "site_settings_general_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_general_social_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_header_nav_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_header_nav_children_link_type" DEFAULT 'page',
  	"page_id" integer,
  	"section" "enum_site_settings_header_nav_children_section",
  	"url" varchar,
  	"anchor" varchar
  );
  
  CREATE TABLE "site_settings_header_nav_children_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_header_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_header_nav_link_type" DEFAULT 'page',
  	"page_id" integer,
  	"section" "enum_site_settings_header_nav_section",
  	"url" varchar,
  	"anchor" varchar,
  	"highlight" boolean
  );
  
  CREATE TABLE "site_settings_header_nav_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_footer_columns_links_link_type" DEFAULT 'page',
  	"page_id" integer,
  	"section" "enum_site_settings_footer_columns_links_section",
  	"url" varchar,
  	"anchor" varchar
  );
  
  CREATE TABLE "site_settings_footer_columns_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_columns_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_footer_legal_links_link_type" DEFAULT 'page',
  	"page_id" integer,
  	"section" "enum_site_settings_footer_legal_links_section",
  	"url" varchar,
  	"anchor" varchar
  );
  
  CREATE TABLE "site_settings_footer_legal_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"general_name" varchar NOT NULL,
  	"general_logo_id" integer,
  	"general_contact_address" varchar,
  	"general_contact_email" varchar,
  	"general_contact_phone" varchar,
  	"footer_show_newsletter" boolean DEFAULT true,
  	"newsletter_brevo_list_id" numeric,
  	"calendar_default_view" "enum_site_settings_calendar_default_view" DEFAULT 'list',
  	"calendar_show_subscribe" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_locales" (
  	"general_tagline" varchar,
  	"newsletter_heading" varchar,
  	"newsletter_intro" varchar,
  	"newsletter_placeholder" varchar,
  	"newsletter_button_label" varchar,
  	"newsletter_consent_text" varchar,
  	"newsletter_thanks_title" varchar,
  	"newsletter_thanks_message" jsonb,
  	"newsletter_confirmed_title" varchar,
  	"newsletter_confirmed_message" jsonb,
  	"calendar_intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
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
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_checkbox_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message_locales" (
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar
  );
  
  CREATE TABLE "forms_emails_locales" (
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forms_locales" (
  	"submit_button_label" varchar,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"form_id" integer NOT NULL,
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
  	"tenants_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer
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
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_past_event_id_past_events_id_fk" FOREIGN KEY ("past_event_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_files" ADD CONSTRAINT "pages_blocks_documents_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_files" ADD CONSTRAINT "pages_blocks_documents_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_podcast_episodes" ADD CONSTRAINT "pages_blocks_podcast_episodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_podcast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_podcast" ADD CONSTRAINT "pages_blocks_podcast_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter_signup" ADD CONSTRAINT "pages_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form" ADD CONSTRAINT "pages_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form" ADD CONSTRAINT "pages_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_item" ADD CONSTRAINT "pages_blocks_item_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_item" ADD CONSTRAINT "pages_blocks_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_past_event_id_past_events_id_fk" FOREIGN KEY ("past_event_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_files" ADD CONSTRAINT "_pages_v_blocks_documents_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_files" ADD CONSTRAINT "_pages_v_blocks_documents_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_podcast_episodes" ADD CONSTRAINT "_pages_v_blocks_podcast_episodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_podcast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_podcast" ADD CONSTRAINT "_pages_v_blocks_podcast_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" ADD CONSTRAINT "_pages_v_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form" ADD CONSTRAINT "_pages_v_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form" ADD CONSTRAINT "_pages_v_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_item" ADD CONSTRAINT "_pages_v_blocks_item_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_item" ADD CONSTRAINT "_pages_v_blocks_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_speakers" ADD CONSTRAINT "events_speakers_speaker_id_speakers_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_speakers" ADD CONSTRAINT "events_speakers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "past_events_blocks_video" ADD CONSTRAINT "past_events_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_video" ADD CONSTRAINT "past_events_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_image_text" ADD CONSTRAINT "past_events_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_image_text" ADD CONSTRAINT "past_events_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_gallery" ADD CONSTRAINT "past_events_blocks_gallery_past_event_id_past_events_id_fk" FOREIGN KEY ("past_event_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_gallery" ADD CONSTRAINT "past_events_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_documents_files" ADD CONSTRAINT "past_events_blocks_documents_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_documents_files" ADD CONSTRAINT "past_events_blocks_documents_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_documents_files_locales" ADD CONSTRAINT "past_events_blocks_documents_files_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_documents_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_documents" ADD CONSTRAINT "past_events_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_podcast_episodes" ADD CONSTRAINT "past_events_blocks_podcast_episodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events_blocks_podcast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_podcast" ADD CONSTRAINT "past_events_blocks_podcast_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_form" ADD CONSTRAINT "past_events_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_form" ADD CONSTRAINT "past_events_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_blocks_item" ADD CONSTRAINT "past_events_blocks_item_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_blocks_item" ADD CONSTRAINT "past_events_blocks_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_hero_img_id_media_id_fk" FOREIGN KEY ("hero_img_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events" ADD CONSTRAINT "past_events_related_event_id_events_id_fk" FOREIGN KEY ("related_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_events_rels" ADD CONSTRAINT "past_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."past_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_rels" ADD CONSTRAINT "past_events_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "past_events_rels" ADD CONSTRAINT "past_events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "_past_events_v_blocks_video" ADD CONSTRAINT "_past_events_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_video" ADD CONSTRAINT "_past_events_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_image_text" ADD CONSTRAINT "_past_events_v_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_image_text" ADD CONSTRAINT "_past_events_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_gallery" ADD CONSTRAINT "_past_events_v_blocks_gallery_past_event_id_past_events_id_fk" FOREIGN KEY ("past_event_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_gallery" ADD CONSTRAINT "_past_events_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_documents_files" ADD CONSTRAINT "_past_events_v_blocks_documents_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_documents_files" ADD CONSTRAINT "_past_events_v_blocks_documents_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_documents_files_locales" ADD CONSTRAINT "_past_events_v_blocks_documents_files_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_documents_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_documents" ADD CONSTRAINT "_past_events_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_podcast_episodes" ADD CONSTRAINT "_past_events_v_blocks_podcast_episodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v_blocks_podcast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_podcast" ADD CONSTRAINT "_past_events_v_blocks_podcast_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_form" ADD CONSTRAINT "_past_events_v_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_form" ADD CONSTRAINT "_past_events_v_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_item" ADD CONSTRAINT "_past_events_v_blocks_item_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_blocks_item" ADD CONSTRAINT "_past_events_v_blocks_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_parent_id_past_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_hero_img_id_media_id_fk" FOREIGN KEY ("version_hero_img_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v" ADD CONSTRAINT "_past_events_v_version_related_event_id_events_id_fk" FOREIGN KEY ("version_related_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_past_events_v_rels" ADD CONSTRAINT "_past_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_past_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_rels" ADD CONSTRAINT "_past_events_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_past_events_v_rels" ADD CONSTRAINT "_past_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "newsletters_blocks_video" ADD CONSTRAINT "newsletters_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_video" ADD CONSTRAINT "newsletters_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_image_text" ADD CONSTRAINT "newsletters_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_image_text" ADD CONSTRAINT "newsletters_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_gallery" ADD CONSTRAINT "newsletters_blocks_gallery_past_event_id_past_events_id_fk" FOREIGN KEY ("past_event_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_gallery" ADD CONSTRAINT "newsletters_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_documents_files" ADD CONSTRAINT "newsletters_blocks_documents_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_documents_files" ADD CONSTRAINT "newsletters_blocks_documents_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_documents_files_locales" ADD CONSTRAINT "newsletters_blocks_documents_files_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_documents_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_documents" ADD CONSTRAINT "newsletters_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_podcast_episodes" ADD CONSTRAINT "newsletters_blocks_podcast_episodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters_blocks_podcast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_podcast" ADD CONSTRAINT "newsletters_blocks_podcast_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_form" ADD CONSTRAINT "newsletters_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_form" ADD CONSTRAINT "newsletters_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_item" ADD CONSTRAINT "newsletters_blocks_item_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_item" ADD CONSTRAINT "newsletters_blocks_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_author_id_speakers_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_texts" ADD CONSTRAINT "newsletters_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "_newsletters_v_blocks_video" ADD CONSTRAINT "_newsletters_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_video" ADD CONSTRAINT "_newsletters_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_image_text" ADD CONSTRAINT "_newsletters_v_blocks_image_text_image_src_id_media_id_fk" FOREIGN KEY ("image_src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_image_text" ADD CONSTRAINT "_newsletters_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_gallery" ADD CONSTRAINT "_newsletters_v_blocks_gallery_past_event_id_past_events_id_fk" FOREIGN KEY ("past_event_id") REFERENCES "public"."past_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_gallery" ADD CONSTRAINT "_newsletters_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_documents_files" ADD CONSTRAINT "_newsletters_v_blocks_documents_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_documents_files" ADD CONSTRAINT "_newsletters_v_blocks_documents_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_documents_files_locales" ADD CONSTRAINT "_newsletters_v_blocks_documents_files_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_documents_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_documents" ADD CONSTRAINT "_newsletters_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_podcast_episodes" ADD CONSTRAINT "_newsletters_v_blocks_podcast_episodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v_blocks_podcast"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_podcast" ADD CONSTRAINT "_newsletters_v_blocks_podcast_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_form" ADD CONSTRAINT "_newsletters_v_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_form" ADD CONSTRAINT "_newsletters_v_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_item" ADD CONSTRAINT "_newsletters_v_blocks_item_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_item" ADD CONSTRAINT "_newsletters_v_blocks_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_parent_id_newsletters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_version_author_id_speakers_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_texts" ADD CONSTRAINT "_newsletters_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_supporting_document_id_media_id_fk" FOREIGN KEY ("supporting_document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vacancies_texts" ADD CONSTRAINT "vacancies_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "speakers" ADD CONSTRAINT "speakers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "speakers" ADD CONSTRAINT "speakers_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_general_social" ADD CONSTRAINT "site_settings_general_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_children" ADD CONSTRAINT "site_settings_header_nav_children_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_children" ADD CONSTRAINT "site_settings_header_nav_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_header_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_children_locales" ADD CONSTRAINT "site_settings_header_nav_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_header_nav_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav" ADD CONSTRAINT "site_settings_header_nav_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav" ADD CONSTRAINT "site_settings_header_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_nav_locales" ADD CONSTRAINT "site_settings_header_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_header_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns_links" ADD CONSTRAINT "site_settings_footer_columns_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns_links" ADD CONSTRAINT "site_settings_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns_links_locales" ADD CONSTRAINT "site_settings_footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns" ADD CONSTRAINT "site_settings_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_columns_locales" ADD CONSTRAINT "site_settings_footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_legal_links" ADD CONSTRAINT "site_settings_footer_legal_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_footer_legal_links" ADD CONSTRAINT "site_settings_footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_legal_links_locales" ADD CONSTRAINT "site_settings_footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_general_logo_id_media_id_fk" FOREIGN KEY ("general_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox_locales" ADD CONSTRAINT "forms_blocks_checkbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_checkbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email_locales" ADD CONSTRAINT "forms_blocks_email_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_email"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message_locales" ADD CONSTRAINT "forms_blocks_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number_locales" ADD CONSTRAINT "forms_blocks_number_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_number"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options_locales" ADD CONSTRAINT "forms_blocks_select_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_locales" ADD CONSTRAINT "forms_blocks_select_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text_locales" ADD CONSTRAINT "forms_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea_locales" ADD CONSTRAINT "forms_blocks_textarea_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_textarea"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails_locales" ADD CONSTRAINT "forms_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms" ADD CONSTRAINT "forms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE INDEX "pages_blocks_video_poster_idx" ON "pages_blocks_video" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_locale_idx" ON "pages_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_text_image_image_src_idx" ON "pages_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_locale_idx" ON "pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_past_event_idx" ON "pages_blocks_gallery" USING btree ("past_event_id");
  CREATE INDEX "pages_blocks_documents_files_order_idx" ON "pages_blocks_documents_files" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_files_parent_id_idx" ON "pages_blocks_documents_files" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_files_locale_idx" ON "pages_blocks_documents_files" USING btree ("_locale");
  CREATE INDEX "pages_blocks_documents_files_file_idx" ON "pages_blocks_documents_files" USING btree ("file_id");
  CREATE INDEX "pages_blocks_documents_order_idx" ON "pages_blocks_documents" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_parent_id_idx" ON "pages_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_path_idx" ON "pages_blocks_documents" USING btree ("_path");
  CREATE INDEX "pages_blocks_documents_locale_idx" ON "pages_blocks_documents" USING btree ("_locale");
  CREATE INDEX "pages_blocks_podcast_episodes_order_idx" ON "pages_blocks_podcast_episodes" USING btree ("_order");
  CREATE INDEX "pages_blocks_podcast_episodes_parent_id_idx" ON "pages_blocks_podcast_episodes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_podcast_episodes_locale_idx" ON "pages_blocks_podcast_episodes" USING btree ("_locale");
  CREATE INDEX "pages_blocks_podcast_order_idx" ON "pages_blocks_podcast" USING btree ("_order");
  CREATE INDEX "pages_blocks_podcast_parent_id_idx" ON "pages_blocks_podcast" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_podcast_path_idx" ON "pages_blocks_podcast" USING btree ("_path");
  CREATE INDEX "pages_blocks_podcast_locale_idx" ON "pages_blocks_podcast" USING btree ("_locale");
  CREATE INDEX "pages_blocks_newsletter_signup_order_idx" ON "pages_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_signup_parent_id_idx" ON "pages_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_signup_path_idx" ON "pages_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_signup_locale_idx" ON "pages_blocks_newsletter_signup" USING btree ("_locale");
  CREATE INDEX "pages_blocks_form_order_idx" ON "pages_blocks_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_parent_id_idx" ON "pages_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_path_idx" ON "pages_blocks_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_locale_idx" ON "pages_blocks_form" USING btree ("_locale");
  CREATE INDEX "pages_blocks_form_form_idx" ON "pages_blocks_form" USING btree ("form_id");
  CREATE INDEX "pages_blocks_item_order_idx" ON "pages_blocks_item" USING btree ("_order");
  CREATE INDEX "pages_blocks_item_parent_id_idx" ON "pages_blocks_item" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_item_path_idx" ON "pages_blocks_item" USING btree ("_path");
  CREATE INDEX "pages_blocks_item_locale_idx" ON "pages_blocks_item" USING btree ("_locale");
  CREATE INDEX "pages_blocks_item_form_idx" ON "pages_blocks_item" USING btree ("form_id");
  CREATE INDEX "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_legacy_id_idx" ON "pages" USING btree ("legacy_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_path_idx" ON "pages_locales" USING btree ("path","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "pages_rels_events_id_idx" ON "pages_rels" USING btree ("events_id","locale");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id","locale");
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
  CREATE INDEX "_pages_v_blocks_video_poster_idx" ON "_pages_v_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_image_text_order_idx" ON "_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_text_parent_id_idx" ON "_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_path_idx" ON "_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_locale_idx" ON "_pages_v_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_text_image_image_src_idx" ON "_pages_v_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_locale_idx" ON "_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_past_event_idx" ON "_pages_v_blocks_gallery" USING btree ("past_event_id");
  CREATE INDEX "_pages_v_blocks_documents_files_order_idx" ON "_pages_v_blocks_documents_files" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_files_parent_id_idx" ON "_pages_v_blocks_documents_files" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_files_locale_idx" ON "_pages_v_blocks_documents_files" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_documents_files_file_idx" ON "_pages_v_blocks_documents_files" USING btree ("file_id");
  CREATE INDEX "_pages_v_blocks_documents_order_idx" ON "_pages_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_parent_id_idx" ON "_pages_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_path_idx" ON "_pages_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_documents_locale_idx" ON "_pages_v_blocks_documents" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_podcast_episodes_order_idx" ON "_pages_v_blocks_podcast_episodes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_podcast_episodes_parent_id_idx" ON "_pages_v_blocks_podcast_episodes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_podcast_episodes_locale_idx" ON "_pages_v_blocks_podcast_episodes" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_podcast_order_idx" ON "_pages_v_blocks_podcast" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_podcast_parent_id_idx" ON "_pages_v_blocks_podcast" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_podcast_path_idx" ON "_pages_v_blocks_podcast" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_podcast_locale_idx" ON "_pages_v_blocks_podcast" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_order_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_parent_id_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_path_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_locale_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_form_order_idx" ON "_pages_v_blocks_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_parent_id_idx" ON "_pages_v_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_path_idx" ON "_pages_v_blocks_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_locale_idx" ON "_pages_v_blocks_form" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_form_form_idx" ON "_pages_v_blocks_form" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_item_order_idx" ON "_pages_v_blocks_item" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_item_parent_id_idx" ON "_pages_v_blocks_item" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_item_path_idx" ON "_pages_v_blocks_item" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_item_locale_idx" ON "_pages_v_blocks_item" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_item_form_idx" ON "_pages_v_blocks_item" USING btree ("form_id");
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
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_rels_events_id_idx" ON "_pages_v_rels" USING btree ("events_id","locale");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id","locale");
  CREATE INDEX "events_speakers_order_idx" ON "events_speakers" USING btree ("_order");
  CREATE INDEX "events_speakers_parent_id_idx" ON "events_speakers" USING btree ("_parent_id");
  CREATE INDEX "events_speakers_speaker_idx" ON "events_speakers" USING btree ("speaker_id");
  CREATE INDEX "events_tenant_idx" ON "events" USING btree ("tenant_id");
  CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
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
  CREATE INDEX "past_events_blocks_video_poster_idx" ON "past_events_blocks_video" USING btree ("poster_id");
  CREATE INDEX "past_events_blocks_image_text_order_idx" ON "past_events_blocks_image_text" USING btree ("_order");
  CREATE INDEX "past_events_blocks_image_text_parent_id_idx" ON "past_events_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_image_text_path_idx" ON "past_events_blocks_image_text" USING btree ("_path");
  CREATE INDEX "past_events_blocks_image_text_image_image_src_idx" ON "past_events_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "past_events_blocks_gallery_order_idx" ON "past_events_blocks_gallery" USING btree ("_order");
  CREATE INDEX "past_events_blocks_gallery_parent_id_idx" ON "past_events_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_gallery_path_idx" ON "past_events_blocks_gallery" USING btree ("_path");
  CREATE INDEX "past_events_blocks_gallery_past_event_idx" ON "past_events_blocks_gallery" USING btree ("past_event_id");
  CREATE INDEX "past_events_blocks_documents_files_order_idx" ON "past_events_blocks_documents_files" USING btree ("_order");
  CREATE INDEX "past_events_blocks_documents_files_parent_id_idx" ON "past_events_blocks_documents_files" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_documents_files_file_idx" ON "past_events_blocks_documents_files" USING btree ("file_id");
  CREATE UNIQUE INDEX "past_events_blocks_documents_files_locales_locale_parent_id_" ON "past_events_blocks_documents_files_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "past_events_blocks_documents_order_idx" ON "past_events_blocks_documents" USING btree ("_order");
  CREATE INDEX "past_events_blocks_documents_parent_id_idx" ON "past_events_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_documents_path_idx" ON "past_events_blocks_documents" USING btree ("_path");
  CREATE INDEX "past_events_blocks_podcast_episodes_order_idx" ON "past_events_blocks_podcast_episodes" USING btree ("_order");
  CREATE INDEX "past_events_blocks_podcast_episodes_parent_id_idx" ON "past_events_blocks_podcast_episodes" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_podcast_order_idx" ON "past_events_blocks_podcast" USING btree ("_order");
  CREATE INDEX "past_events_blocks_podcast_parent_id_idx" ON "past_events_blocks_podcast" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_podcast_path_idx" ON "past_events_blocks_podcast" USING btree ("_path");
  CREATE INDEX "past_events_blocks_form_order_idx" ON "past_events_blocks_form" USING btree ("_order");
  CREATE INDEX "past_events_blocks_form_parent_id_idx" ON "past_events_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_form_path_idx" ON "past_events_blocks_form" USING btree ("_path");
  CREATE INDEX "past_events_blocks_form_form_idx" ON "past_events_blocks_form" USING btree ("form_id");
  CREATE INDEX "past_events_blocks_item_order_idx" ON "past_events_blocks_item" USING btree ("_order");
  CREATE INDEX "past_events_blocks_item_parent_id_idx" ON "past_events_blocks_item" USING btree ("_parent_id");
  CREATE INDEX "past_events_blocks_item_path_idx" ON "past_events_blocks_item" USING btree ("_path");
  CREATE INDEX "past_events_blocks_item_form_idx" ON "past_events_blocks_item" USING btree ("form_id");
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
  CREATE INDEX "past_events_rels_media_id_idx" ON "past_events_rels" USING btree ("media_id");
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
  CREATE INDEX "_past_events_v_blocks_video_poster_idx" ON "_past_events_v_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_past_events_v_blocks_image_text_order_idx" ON "_past_events_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_image_text_parent_id_idx" ON "_past_events_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_image_text_path_idx" ON "_past_events_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_image_text_image_image_src_idx" ON "_past_events_v_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "_past_events_v_blocks_gallery_order_idx" ON "_past_events_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_gallery_parent_id_idx" ON "_past_events_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_gallery_path_idx" ON "_past_events_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_gallery_past_event_idx" ON "_past_events_v_blocks_gallery" USING btree ("past_event_id");
  CREATE INDEX "_past_events_v_blocks_documents_files_order_idx" ON "_past_events_v_blocks_documents_files" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_documents_files_parent_id_idx" ON "_past_events_v_blocks_documents_files" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_documents_files_file_idx" ON "_past_events_v_blocks_documents_files" USING btree ("file_id");
  CREATE UNIQUE INDEX "_past_events_v_blocks_documents_files_locales_locale_parent_" ON "_past_events_v_blocks_documents_files_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_past_events_v_blocks_documents_order_idx" ON "_past_events_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_documents_parent_id_idx" ON "_past_events_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_documents_path_idx" ON "_past_events_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_podcast_episodes_order_idx" ON "_past_events_v_blocks_podcast_episodes" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_podcast_episodes_parent_id_idx" ON "_past_events_v_blocks_podcast_episodes" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_podcast_order_idx" ON "_past_events_v_blocks_podcast" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_podcast_parent_id_idx" ON "_past_events_v_blocks_podcast" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_podcast_path_idx" ON "_past_events_v_blocks_podcast" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_form_order_idx" ON "_past_events_v_blocks_form" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_form_parent_id_idx" ON "_past_events_v_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_form_path_idx" ON "_past_events_v_blocks_form" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_form_form_idx" ON "_past_events_v_blocks_form" USING btree ("form_id");
  CREATE INDEX "_past_events_v_blocks_item_order_idx" ON "_past_events_v_blocks_item" USING btree ("_order");
  CREATE INDEX "_past_events_v_blocks_item_parent_id_idx" ON "_past_events_v_blocks_item" USING btree ("_parent_id");
  CREATE INDEX "_past_events_v_blocks_item_path_idx" ON "_past_events_v_blocks_item" USING btree ("_path");
  CREATE INDEX "_past_events_v_blocks_item_form_idx" ON "_past_events_v_blocks_item" USING btree ("form_id");
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
  CREATE INDEX "_past_events_v_rels_media_id_idx" ON "_past_events_v_rels" USING btree ("media_id");
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
  CREATE INDEX "newsletters_blocks_video_poster_idx" ON "newsletters_blocks_video" USING btree ("poster_id");
  CREATE INDEX "newsletters_blocks_image_text_order_idx" ON "newsletters_blocks_image_text" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_image_text_parent_id_idx" ON "newsletters_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_image_text_path_idx" ON "newsletters_blocks_image_text" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_image_text_image_image_src_idx" ON "newsletters_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "newsletters_blocks_gallery_order_idx" ON "newsletters_blocks_gallery" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_gallery_parent_id_idx" ON "newsletters_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_gallery_path_idx" ON "newsletters_blocks_gallery" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_gallery_past_event_idx" ON "newsletters_blocks_gallery" USING btree ("past_event_id");
  CREATE INDEX "newsletters_blocks_documents_files_order_idx" ON "newsletters_blocks_documents_files" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_documents_files_parent_id_idx" ON "newsletters_blocks_documents_files" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_documents_files_file_idx" ON "newsletters_blocks_documents_files" USING btree ("file_id");
  CREATE UNIQUE INDEX "newsletters_blocks_documents_files_locales_locale_parent_id_" ON "newsletters_blocks_documents_files_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "newsletters_blocks_documents_order_idx" ON "newsletters_blocks_documents" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_documents_parent_id_idx" ON "newsletters_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_documents_path_idx" ON "newsletters_blocks_documents" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_podcast_episodes_order_idx" ON "newsletters_blocks_podcast_episodes" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_podcast_episodes_parent_id_idx" ON "newsletters_blocks_podcast_episodes" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_podcast_order_idx" ON "newsletters_blocks_podcast" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_podcast_parent_id_idx" ON "newsletters_blocks_podcast" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_podcast_path_idx" ON "newsletters_blocks_podcast" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_form_order_idx" ON "newsletters_blocks_form" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_form_parent_id_idx" ON "newsletters_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_form_path_idx" ON "newsletters_blocks_form" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_form_form_idx" ON "newsletters_blocks_form" USING btree ("form_id");
  CREATE INDEX "newsletters_blocks_item_order_idx" ON "newsletters_blocks_item" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_item_parent_id_idx" ON "newsletters_blocks_item" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_item_path_idx" ON "newsletters_blocks_item" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_item_form_idx" ON "newsletters_blocks_item" USING btree ("form_id");
  CREATE INDEX "newsletters_tenant_idx" ON "newsletters" USING btree ("tenant_id");
  CREATE INDEX "newsletters_slug_idx" ON "newsletters" USING btree ("slug");
  CREATE INDEX "newsletters_author_idx" ON "newsletters" USING btree ("author_id");
  CREATE INDEX "newsletters_featured_image_idx" ON "newsletters" USING btree ("featured_image_id");
  CREATE INDEX "newsletters_legacy_id_idx" ON "newsletters" USING btree ("legacy_id");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  CREATE INDEX "newsletters__status_idx" ON "newsletters" USING btree ("_status");
  CREATE INDEX "newsletters_texts_order_parent" ON "newsletters_texts" USING btree ("order","parent_id");
  CREATE INDEX "newsletters_rels_order_idx" ON "newsletters_rels" USING btree ("order");
  CREATE INDEX "newsletters_rels_parent_idx" ON "newsletters_rels" USING btree ("parent_id");
  CREATE INDEX "newsletters_rels_path_idx" ON "newsletters_rels" USING btree ("path");
  CREATE INDEX "newsletters_rels_media_id_idx" ON "newsletters_rels" USING btree ("media_id");
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
  CREATE INDEX "_newsletters_v_blocks_video_poster_idx" ON "_newsletters_v_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_newsletters_v_blocks_image_text_order_idx" ON "_newsletters_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_image_text_parent_id_idx" ON "_newsletters_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_image_text_path_idx" ON "_newsletters_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_image_text_image_image_src_idx" ON "_newsletters_v_blocks_image_text" USING btree ("image_src_id");
  CREATE INDEX "_newsletters_v_blocks_gallery_order_idx" ON "_newsletters_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_gallery_parent_id_idx" ON "_newsletters_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_gallery_path_idx" ON "_newsletters_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_gallery_past_event_idx" ON "_newsletters_v_blocks_gallery" USING btree ("past_event_id");
  CREATE INDEX "_newsletters_v_blocks_documents_files_order_idx" ON "_newsletters_v_blocks_documents_files" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_documents_files_parent_id_idx" ON "_newsletters_v_blocks_documents_files" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_documents_files_file_idx" ON "_newsletters_v_blocks_documents_files" USING btree ("file_id");
  CREATE UNIQUE INDEX "_newsletters_v_blocks_documents_files_locales_locale_parent_" ON "_newsletters_v_blocks_documents_files_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_newsletters_v_blocks_documents_order_idx" ON "_newsletters_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_documents_parent_id_idx" ON "_newsletters_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_documents_path_idx" ON "_newsletters_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_podcast_episodes_order_idx" ON "_newsletters_v_blocks_podcast_episodes" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_podcast_episodes_parent_id_idx" ON "_newsletters_v_blocks_podcast_episodes" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_podcast_order_idx" ON "_newsletters_v_blocks_podcast" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_podcast_parent_id_idx" ON "_newsletters_v_blocks_podcast" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_podcast_path_idx" ON "_newsletters_v_blocks_podcast" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_form_order_idx" ON "_newsletters_v_blocks_form" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_form_parent_id_idx" ON "_newsletters_v_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_form_path_idx" ON "_newsletters_v_blocks_form" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_form_form_idx" ON "_newsletters_v_blocks_form" USING btree ("form_id");
  CREATE INDEX "_newsletters_v_blocks_item_order_idx" ON "_newsletters_v_blocks_item" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_item_parent_id_idx" ON "_newsletters_v_blocks_item" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_item_path_idx" ON "_newsletters_v_blocks_item" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_item_form_idx" ON "_newsletters_v_blocks_item" USING btree ("form_id");
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
  CREATE INDEX "_newsletters_v_rels_order_idx" ON "_newsletters_v_rels" USING btree ("order");
  CREATE INDEX "_newsletters_v_rels_parent_idx" ON "_newsletters_v_rels" USING btree ("parent_id");
  CREATE INDEX "_newsletters_v_rels_path_idx" ON "_newsletters_v_rels" USING btree ("path");
  CREATE INDEX "_newsletters_v_rels_media_id_idx" ON "_newsletters_v_rels" USING btree ("media_id");
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
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "redirects_tenant_idx" ON "redirects" USING btree ("tenant_id");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "site_settings_general_social_order_idx" ON "site_settings_general_social" USING btree ("_order");
  CREATE INDEX "site_settings_general_social_parent_id_idx" ON "site_settings_general_social" USING btree ("_parent_id");
  CREATE INDEX "site_settings_header_nav_children_order_idx" ON "site_settings_header_nav_children" USING btree ("_order");
  CREATE INDEX "site_settings_header_nav_children_parent_id_idx" ON "site_settings_header_nav_children" USING btree ("_parent_id");
  CREATE INDEX "site_settings_header_nav_children_page_idx" ON "site_settings_header_nav_children" USING btree ("page_id");
  CREATE UNIQUE INDEX "site_settings_header_nav_children_locales_locale_parent_id_u" ON "site_settings_header_nav_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_header_nav_order_idx" ON "site_settings_header_nav" USING btree ("_order");
  CREATE INDEX "site_settings_header_nav_parent_id_idx" ON "site_settings_header_nav" USING btree ("_parent_id");
  CREATE INDEX "site_settings_header_nav_page_idx" ON "site_settings_header_nav" USING btree ("page_id");
  CREATE UNIQUE INDEX "site_settings_header_nav_locales_locale_parent_id_unique" ON "site_settings_header_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_footer_columns_links_order_idx" ON "site_settings_footer_columns_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_columns_links_parent_id_idx" ON "site_settings_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_columns_links_page_idx" ON "site_settings_footer_columns_links" USING btree ("page_id");
  CREATE UNIQUE INDEX "site_settings_footer_columns_links_locales_locale_parent_id_" ON "site_settings_footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_footer_columns_order_idx" ON "site_settings_footer_columns" USING btree ("_order");
  CREATE INDEX "site_settings_footer_columns_parent_id_idx" ON "site_settings_footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_footer_columns_locales_locale_parent_id_unique" ON "site_settings_footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_footer_legal_links_order_idx" ON "site_settings_footer_legal_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_legal_links_parent_id_idx" ON "site_settings_footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_legal_links_page_idx" ON "site_settings_footer_legal_links" USING btree ("page_id");
  CREATE UNIQUE INDEX "site_settings_footer_legal_links_locales_locale_parent_id_un" ON "site_settings_footer_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_settings_tenant_idx" ON "site_settings" USING btree ("tenant_id");
  CREATE INDEX "site_settings_general_general_logo_idx" ON "site_settings" USING btree ("general_logo_id");
  CREATE INDEX "site_settings_updated_at_idx" ON "site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "site_settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_checkbox_locales_locale_parent_id_unique" ON "forms_blocks_checkbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_email_locales_locale_parent_id_unique" ON "forms_blocks_email_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_message_locales_locale_parent_id_unique" ON "forms_blocks_message_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_number_locales_locale_parent_id_unique" ON "forms_blocks_number_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_options_locales_locale_parent_id_unique" ON "forms_blocks_select_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_select_locales_locale_parent_id_unique" ON "forms_blocks_select_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_text_locales_locale_parent_id_unique" ON "forms_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_textarea_locales_locale_parent_id_unique" ON "forms_blocks_textarea_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_emails_locales_locale_parent_id_unique" ON "forms_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_tenant_idx" ON "forms" USING btree ("tenant_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "forms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_tenant_idx" ON "form_submissions" USING btree ("tenant_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
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
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
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
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_documents_files" CASCADE;
  DROP TABLE "pages_blocks_documents" CASCADE;
  DROP TABLE "pages_blocks_podcast_episodes" CASCADE;
  DROP TABLE "pages_blocks_podcast" CASCADE;
  DROP TABLE "pages_blocks_newsletter_signup" CASCADE;
  DROP TABLE "pages_blocks_form" CASCADE;
  DROP TABLE "pages_blocks_item" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
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
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_files" CASCADE;
  DROP TABLE "_pages_v_blocks_documents" CASCADE;
  DROP TABLE "_pages_v_blocks_podcast_episodes" CASCADE;
  DROP TABLE "_pages_v_blocks_podcast" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter_signup" CASCADE;
  DROP TABLE "_pages_v_blocks_form" CASCADE;
  DROP TABLE "_pages_v_blocks_item" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
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
  DROP TABLE "past_events_blocks_gallery" CASCADE;
  DROP TABLE "past_events_blocks_documents_files" CASCADE;
  DROP TABLE "past_events_blocks_documents_files_locales" CASCADE;
  DROP TABLE "past_events_blocks_documents" CASCADE;
  DROP TABLE "past_events_blocks_podcast_episodes" CASCADE;
  DROP TABLE "past_events_blocks_podcast" CASCADE;
  DROP TABLE "past_events_blocks_form" CASCADE;
  DROP TABLE "past_events_blocks_item" CASCADE;
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
  DROP TABLE "_past_events_v_blocks_gallery" CASCADE;
  DROP TABLE "_past_events_v_blocks_documents_files" CASCADE;
  DROP TABLE "_past_events_v_blocks_documents_files_locales" CASCADE;
  DROP TABLE "_past_events_v_blocks_documents" CASCADE;
  DROP TABLE "_past_events_v_blocks_podcast_episodes" CASCADE;
  DROP TABLE "_past_events_v_blocks_podcast" CASCADE;
  DROP TABLE "_past_events_v_blocks_form" CASCADE;
  DROP TABLE "_past_events_v_blocks_item" CASCADE;
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
  DROP TABLE "newsletters_blocks_gallery" CASCADE;
  DROP TABLE "newsletters_blocks_documents_files" CASCADE;
  DROP TABLE "newsletters_blocks_documents_files_locales" CASCADE;
  DROP TABLE "newsletters_blocks_documents" CASCADE;
  DROP TABLE "newsletters_blocks_podcast_episodes" CASCADE;
  DROP TABLE "newsletters_blocks_podcast" CASCADE;
  DROP TABLE "newsletters_blocks_form" CASCADE;
  DROP TABLE "newsletters_blocks_item" CASCADE;
  DROP TABLE "newsletters" CASCADE;
  DROP TABLE "newsletters_texts" CASCADE;
  DROP TABLE "newsletters_rels" CASCADE;
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
  DROP TABLE "_newsletters_v_blocks_gallery" CASCADE;
  DROP TABLE "_newsletters_v_blocks_documents_files" CASCADE;
  DROP TABLE "_newsletters_v_blocks_documents_files_locales" CASCADE;
  DROP TABLE "_newsletters_v_blocks_documents" CASCADE;
  DROP TABLE "_newsletters_v_blocks_podcast_episodes" CASCADE;
  DROP TABLE "_newsletters_v_blocks_podcast" CASCADE;
  DROP TABLE "_newsletters_v_blocks_form" CASCADE;
  DROP TABLE "_newsletters_v_blocks_item" CASCADE;
  DROP TABLE "_newsletters_v" CASCADE;
  DROP TABLE "_newsletters_v_texts" CASCADE;
  DROP TABLE "_newsletters_v_rels" CASCADE;
  DROP TABLE "vacancies" CASCADE;
  DROP TABLE "vacancies_texts" CASCADE;
  DROP TABLE "speakers" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "site_settings_general_social" CASCADE;
  DROP TABLE "site_settings_header_nav_children" CASCADE;
  DROP TABLE "site_settings_header_nav_children_locales" CASCADE;
  DROP TABLE "site_settings_header_nav" CASCADE;
  DROP TABLE "site_settings_header_nav_locales" CASCADE;
  DROP TABLE "site_settings_footer_columns_links" CASCADE;
  DROP TABLE "site_settings_footer_columns_links_locales" CASCADE;
  DROP TABLE "site_settings_footer_columns" CASCADE;
  DROP TABLE "site_settings_footer_columns_locales" CASCADE;
  DROP TABLE "site_settings_footer_legal_links" CASCADE;
  DROP TABLE "site_settings_footer_legal_links_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_tenants_roles" CASCADE;
  DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_checkbox_locales" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_email_locales" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_message_locales" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_number_locales" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select_options_locales" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_select_locales" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_text_locales" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_blocks_textarea_locales" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms_emails_locales" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "forms_locales" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_blocks_hero_actions_type";
  DROP TYPE "public"."enum_pages_blocks_hero_background";
  DROP TYPE "public"."enum_pages_blocks_hero_layout";
  DROP TYPE "public"."enum_pages_blocks_events_calendar_preview_background";
  DROP TYPE "public"."enum_pages_blocks_events_calendar_preview_mode";
  DROP TYPE "public"."enum_pages_blocks_events_calendar_preview_event_type";
  DROP TYPE "public"."enum_pages_blocks_callout_background";
  DROP TYPE "public"."enum_pages_blocks_features_background";
  DROP TYPE "public"."enum_pages_blocks_stats_background";
  DROP TYPE "public"."enum_pages_blocks_cta_actions_type";
  DROP TYPE "public"."enum_pages_blocks_content_background";
  DROP TYPE "public"."enum_pages_blocks_content_width";
  DROP TYPE "public"."enum_pages_blocks_testimonial_background";
  DROP TYPE "public"."enum_pages_blocks_video_background";
  DROP TYPE "public"."enum_pages_blocks_video_color";
  DROP TYPE "public"."enum_pages_blocks_image_text_background";
  DROP TYPE "public"."enum_pages_blocks_image_text_layout";
  DROP TYPE "public"."enum_pages_blocks_image_text_image_size";
  DROP TYPE "public"."enum_pages_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum_pages_blocks_gallery_background";
  DROP TYPE "public"."enum_pages_blocks_gallery_source";
  DROP TYPE "public"."enum_pages_blocks_documents_background";
  DROP TYPE "public"."enum_pages_blocks_podcast_background";
  DROP TYPE "public"."enum_pages_blocks_podcast_mode";
  DROP TYPE "public"."enum_pages_blocks_newsletter_signup_background";
  DROP TYPE "public"."enum_pages_blocks_form_background";
  DROP TYPE "public"."enum_pages_blocks_item_background";
  DROP TYPE "public"."enum_pages_blocks_item_action_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_actions_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_background";
  DROP TYPE "public"."enum__pages_v_blocks_hero_layout";
  DROP TYPE "public"."enum__pages_v_blocks_events_calendar_preview_background";
  DROP TYPE "public"."enum__pages_v_blocks_events_calendar_preview_mode";
  DROP TYPE "public"."enum__pages_v_blocks_events_calendar_preview_event_type";
  DROP TYPE "public"."enum__pages_v_blocks_callout_background";
  DROP TYPE "public"."enum__pages_v_blocks_features_background";
  DROP TYPE "public"."enum__pages_v_blocks_stats_background";
  DROP TYPE "public"."enum__pages_v_blocks_cta_actions_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_background";
  DROP TYPE "public"."enum__pages_v_blocks_content_width";
  DROP TYPE "public"."enum__pages_v_blocks_testimonial_background";
  DROP TYPE "public"."enum__pages_v_blocks_video_background";
  DROP TYPE "public"."enum__pages_v_blocks_video_color";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_background";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_layout";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_image_size";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_background";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_source";
  DROP TYPE "public"."enum__pages_v_blocks_documents_background";
  DROP TYPE "public"."enum__pages_v_blocks_podcast_background";
  DROP TYPE "public"."enum__pages_v_blocks_podcast_mode";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_signup_background";
  DROP TYPE "public"."enum__pages_v_blocks_form_background";
  DROP TYPE "public"."enum__pages_v_blocks_item_background";
  DROP TYPE "public"."enum__pages_v_blocks_item_action_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_events_language";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_events_event_type";
  DROP TYPE "public"."enum_past_events_blocks_hero_actions_type";
  DROP TYPE "public"."enum_past_events_blocks_hero_background";
  DROP TYPE "public"."enum_past_events_blocks_hero_layout";
  DROP TYPE "public"."enum_past_events_blocks_callout_background";
  DROP TYPE "public"."enum_past_events_blocks_features_background";
  DROP TYPE "public"."enum_past_events_blocks_stats_background";
  DROP TYPE "public"."enum_past_events_blocks_cta_actions_type";
  DROP TYPE "public"."enum_past_events_blocks_content_background";
  DROP TYPE "public"."enum_past_events_blocks_content_width";
  DROP TYPE "public"."enum_past_events_blocks_testimonial_background";
  DROP TYPE "public"."enum_past_events_blocks_video_background";
  DROP TYPE "public"."enum_past_events_blocks_video_color";
  DROP TYPE "public"."enum_past_events_blocks_image_text_background";
  DROP TYPE "public"."enum_past_events_blocks_image_text_layout";
  DROP TYPE "public"."enum_past_events_blocks_image_text_image_size";
  DROP TYPE "public"."enum_past_events_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum_past_events_blocks_gallery_background";
  DROP TYPE "public"."enum_past_events_blocks_gallery_source";
  DROP TYPE "public"."enum_past_events_blocks_documents_background";
  DROP TYPE "public"."enum_past_events_blocks_podcast_background";
  DROP TYPE "public"."enum_past_events_blocks_podcast_mode";
  DROP TYPE "public"."enum_past_events_blocks_form_background";
  DROP TYPE "public"."enum_past_events_blocks_item_background";
  DROP TYPE "public"."enum_past_events_blocks_item_action_type";
  DROP TYPE "public"."enum_past_events_language";
  DROP TYPE "public"."enum_past_events_status";
  DROP TYPE "public"."enum__past_events_v_blocks_hero_actions_type";
  DROP TYPE "public"."enum__past_events_v_blocks_hero_background";
  DROP TYPE "public"."enum__past_events_v_blocks_hero_layout";
  DROP TYPE "public"."enum__past_events_v_blocks_callout_background";
  DROP TYPE "public"."enum__past_events_v_blocks_features_background";
  DROP TYPE "public"."enum__past_events_v_blocks_stats_background";
  DROP TYPE "public"."enum__past_events_v_blocks_cta_actions_type";
  DROP TYPE "public"."enum__past_events_v_blocks_content_background";
  DROP TYPE "public"."enum__past_events_v_blocks_content_width";
  DROP TYPE "public"."enum__past_events_v_blocks_testimonial_background";
  DROP TYPE "public"."enum__past_events_v_blocks_video_background";
  DROP TYPE "public"."enum__past_events_v_blocks_video_color";
  DROP TYPE "public"."enum__past_events_v_blocks_image_text_background";
  DROP TYPE "public"."enum__past_events_v_blocks_image_text_layout";
  DROP TYPE "public"."enum__past_events_v_blocks_image_text_image_size";
  DROP TYPE "public"."enum__past_events_v_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum__past_events_v_blocks_gallery_background";
  DROP TYPE "public"."enum__past_events_v_blocks_gallery_source";
  DROP TYPE "public"."enum__past_events_v_blocks_documents_background";
  DROP TYPE "public"."enum__past_events_v_blocks_podcast_background";
  DROP TYPE "public"."enum__past_events_v_blocks_podcast_mode";
  DROP TYPE "public"."enum__past_events_v_blocks_form_background";
  DROP TYPE "public"."enum__past_events_v_blocks_item_background";
  DROP TYPE "public"."enum__past_events_v_blocks_item_action_type";
  DROP TYPE "public"."enum__past_events_v_version_language";
  DROP TYPE "public"."enum__past_events_v_version_status";
  DROP TYPE "public"."enum__past_events_v_published_locale";
  DROP TYPE "public"."enum_newsletters_blocks_hero_actions_type";
  DROP TYPE "public"."enum_newsletters_blocks_hero_background";
  DROP TYPE "public"."enum_newsletters_blocks_hero_layout";
  DROP TYPE "public"."enum_newsletters_blocks_callout_background";
  DROP TYPE "public"."enum_newsletters_blocks_features_background";
  DROP TYPE "public"."enum_newsletters_blocks_stats_background";
  DROP TYPE "public"."enum_newsletters_blocks_cta_actions_type";
  DROP TYPE "public"."enum_newsletters_blocks_content_background";
  DROP TYPE "public"."enum_newsletters_blocks_content_width";
  DROP TYPE "public"."enum_newsletters_blocks_testimonial_background";
  DROP TYPE "public"."enum_newsletters_blocks_video_background";
  DROP TYPE "public"."enum_newsletters_blocks_video_color";
  DROP TYPE "public"."enum_newsletters_blocks_image_text_background";
  DROP TYPE "public"."enum_newsletters_blocks_image_text_layout";
  DROP TYPE "public"."enum_newsletters_blocks_image_text_image_size";
  DROP TYPE "public"."enum_newsletters_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum_newsletters_blocks_gallery_background";
  DROP TYPE "public"."enum_newsletters_blocks_gallery_source";
  DROP TYPE "public"."enum_newsletters_blocks_documents_background";
  DROP TYPE "public"."enum_newsletters_blocks_podcast_background";
  DROP TYPE "public"."enum_newsletters_blocks_podcast_mode";
  DROP TYPE "public"."enum_newsletters_blocks_form_background";
  DROP TYPE "public"."enum_newsletters_blocks_item_background";
  DROP TYPE "public"."enum_newsletters_blocks_item_action_type";
  DROP TYPE "public"."enum_newsletters_language";
  DROP TYPE "public"."enum_newsletters_type";
  DROP TYPE "public"."enum_newsletters_organization";
  DROP TYPE "public"."enum_newsletters_status";
  DROP TYPE "public"."enum__newsletters_v_blocks_hero_actions_type";
  DROP TYPE "public"."enum__newsletters_v_blocks_hero_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_hero_layout";
  DROP TYPE "public"."enum__newsletters_v_blocks_callout_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_features_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_stats_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_cta_actions_type";
  DROP TYPE "public"."enum__newsletters_v_blocks_content_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_content_width";
  DROP TYPE "public"."enum__newsletters_v_blocks_testimonial_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_video_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_video_color";
  DROP TYPE "public"."enum__newsletters_v_blocks_image_text_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_image_text_layout";
  DROP TYPE "public"."enum__newsletters_v_blocks_image_text_image_size";
  DROP TYPE "public"."enum__newsletters_v_blocks_image_text_vertical_alignment";
  DROP TYPE "public"."enum__newsletters_v_blocks_gallery_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_gallery_source";
  DROP TYPE "public"."enum__newsletters_v_blocks_documents_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_podcast_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_podcast_mode";
  DROP TYPE "public"."enum__newsletters_v_blocks_form_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_item_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_item_action_type";
  DROP TYPE "public"."enum__newsletters_v_version_language";
  DROP TYPE "public"."enum__newsletters_v_version_type";
  DROP TYPE "public"."enum__newsletters_v_version_organization";
  DROP TYPE "public"."enum__newsletters_v_version_status";
  DROP TYPE "public"."enum__newsletters_v_published_locale";
  DROP TYPE "public"."enum_vacancies_language";
  DROP TYPE "public"."enum_vacancies_opportunity_type";
  DROP TYPE "public"."enum_vacancies_location_type";
  DROP TYPE "public"."enum_site_settings_general_social_platform";
  DROP TYPE "public"."enum_site_settings_header_nav_children_link_type";
  DROP TYPE "public"."enum_site_settings_header_nav_children_section";
  DROP TYPE "public"."enum_site_settings_header_nav_link_type";
  DROP TYPE "public"."enum_site_settings_header_nav_section";
  DROP TYPE "public"."enum_site_settings_footer_columns_links_link_type";
  DROP TYPE "public"."enum_site_settings_footer_columns_links_section";
  DROP TYPE "public"."enum_site_settings_footer_legal_links_link_type";
  DROP TYPE "public"."enum_site_settings_footer_legal_links_section";
  DROP TYPE "public"."enum_site_settings_calendar_default_view";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_tenants_roles";
  DROP TYPE "public"."enum_forms_confirmation_type";`)
}
