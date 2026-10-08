import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cta_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_past_events_blocks_cta_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__past_events_v_blocks_cta_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum_newsletters_blocks_cta_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  CREATE TYPE "public"."enum__newsletters_v_blocks_cta_background" AS ENUM('white', 'mist', 'leaf', 'harvest', 'sky', 'dark');
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "background" "enum_pages_blocks_cta_background" DEFAULT 'white';
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "background" "enum__pages_v_blocks_cta_background" DEFAULT 'white';
  ALTER TABLE "past_events_blocks_cta" ADD COLUMN "background" "enum_past_events_blocks_cta_background" DEFAULT 'white';
  ALTER TABLE "_past_events_v_blocks_cta" ADD COLUMN "background" "enum__past_events_v_blocks_cta_background" DEFAULT 'white';
  ALTER TABLE "newsletters_blocks_cta" ADD COLUMN "background" "enum_newsletters_blocks_cta_background" DEFAULT 'white';
  ALTER TABLE "_newsletters_v_blocks_cta" ADD COLUMN "background" "enum__newsletters_v_blocks_cta_background" DEFAULT 'white';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" DROP COLUMN "background";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "background";
  ALTER TABLE "past_events_blocks_cta" DROP COLUMN "background";
  ALTER TABLE "_past_events_v_blocks_cta" DROP COLUMN "background";
  ALTER TABLE "newsletters_blocks_cta" DROP COLUMN "background";
  ALTER TABLE "_newsletters_v_blocks_cta" DROP COLUMN "background";
  DROP TYPE "public"."enum_pages_blocks_cta_background";
  DROP TYPE "public"."enum__pages_v_blocks_cta_background";
  DROP TYPE "public"."enum_past_events_blocks_cta_background";
  DROP TYPE "public"."enum__past_events_v_blocks_cta_background";
  DROP TYPE "public"."enum_newsletters_blocks_cta_background";
  DROP TYPE "public"."enum__newsletters_v_blocks_cta_background";`)
}
