import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "title" varchar;
   -- Settings that exist already get their title now. New ones get it when they are saved.
   UPDATE "site_settings" SET "title" = 'Settings of ' || "general_name" WHERE "title" IS NULL AND "general_name" IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "title";`)
}
