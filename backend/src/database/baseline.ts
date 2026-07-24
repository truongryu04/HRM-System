import 'reflect-metadata';
import 'dotenv/config';

import AppDataSource from './data-source';

const INITIAL_MIGRATION_TIMESTAMP = '1784867394905';
const INITIAL_MIGRATION_NAME = 'InitialSchema1784867394905';

async function baseline(): Promise<void> {
  if (process.env.ALLOW_MIGRATION_BASELINE !== 'true') {
    throw new Error(
      'Set ALLOW_MIGRATION_BASELINE=true only after creating a verified backup',
    );
  }

  await AppDataSource.initialize();

  try {
    const schemaDiff = await AppDataSource.driver.createSchemaBuilder().log();

    if (schemaDiff.upQueries.length > 0) {
      throw new Error(
        `Current schema differs from the entities (${schemaDiff.upQueries.length} pending schema changes). Baseline was not applied.`,
      );
    }

    await AppDataSource.transaction(async (manager) => {
      await manager.query(`
        CREATE TABLE IF NOT EXISTS "typeorm_migrations" (
          "id" SERIAL NOT NULL,
          "timestamp" bigint NOT NULL,
          "name" character varying NOT NULL,
          CONSTRAINT "PK_bb2f075707dd300ba86d0208923" PRIMARY KEY ("id")
        )
      `);
      await manager.query(
        `
          INSERT INTO "typeorm_migrations" ("timestamp", "name")
          SELECT $1::bigint, $2::character varying
          WHERE NOT EXISTS (
            SELECT 1
            FROM "typeorm_migrations"
            WHERE "timestamp" = $1::bigint
               OR "name" = $2::character varying
          )
        `,
        [INITIAL_MIGRATION_TIMESTAMP, INITIAL_MIGRATION_NAME],
      );
    });

    console.log('Initial migration baseline recorded successfully');
  } finally {
    await AppDataSource.destroy();
  }
}

baseline().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Migration baseline failed: ${message}`);
  process.exitCode = 1;
});
