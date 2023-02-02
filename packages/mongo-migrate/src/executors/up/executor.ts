import { ExecutorContext, ProjectGraphProjectNode } from '@nrwl/devkit';
import { Database } from '../../data/db';
import { getNxProject } from '../../utils/nx';
import { validateMigrationInitialization } from '../../utils/project';
import { UpExecutorSchema } from './schema';

import * as path from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import { MigrationDocument, migrationSchema } from '../../data/migration.schema';
import { getMigrations, hashFile } from '../../utils/common';

const validateAppliedMigrations = async (migration: MigrationDocument, migrationPath: string) => {
  if (!migrationPath) throw `Migration file ${migration.filename} is missing`;

  const file = readFileSync(migrationPath);
  const fileHash = hashFile(file);

  if (migration.hash !== fileHash) throw `Migration ${migration.id} is out of sync`;
};

interface ApplyMigrationArgs {
  db: mongoose.Connection['db'];
  project: ProjectGraphProjectNode;
  Migrations: mongoose.Model<MigrationDocument, object, object, object, any>;
  migration: string;
}

const applyMigration = async ({ db, project, Migrations, migration }: ApplyMigrationArgs) => {
  const migrationImport = await import(migration);

  if (!migrationImport.default) throw 'Malformed migration file';
  const migrationConfig = migrationImport.default;

  if (!migrationConfig.up) throw 'Malformed migration file';
  await migrationConfig.up(db);

  const filename = path.basename(migration);
  const file = readFileSync(migration);
  const hash = hashFile(file);

  return Migrations.create({ project: project.name, filename, hash, dateApplied: new Date() });
};

export default async function runExecutor(options: UpExecutorSchema, context: ExecutorContext) {
  const project = getNxProject(context.projectName);

  validateMigrationInitialization(project);

  const configImport = await import(path.join(context.root, 'migration.config'));
  const config = await configImport.default();
  const db = new Database(config);
  await db.connect();

  const Migrations = mongoose.model<MigrationDocument>('Migration', migrationSchema, db.migrationCollection);

  const migrationDirectory = path.resolve(context.root, project.data.root, project.data['migrationDirectory']);

  // get migrations from migrations directory, filter .gitkeep, and sort oldest to newest
  const migrations = getMigrations(migrationDirectory);

  if (migrations.length === 0) {
    console.error('No migrations to apply. Try using the mongo-migrate generator first to create a new migration');
    return {
      success: false,
    };
  }

  const appliedMigrations = await Migrations.find({ project: project.name }, { filename: 1, hash: 1 });

  // check all applied migrations and ensure hashes match db - if not throw out of sync error
  await Promise.all(
    appliedMigrations.map((m) =>
      validateAppliedMigrations(
        m,
        migrations.find((name) => path.basename(name) === m.filename)
      )
    )
  );

  // apply migrations for all new files in order
  const pendingMigrations = migrations.filter((file) => !appliedMigrations.find((m) => m.filename === path.basename(file)));

  const migrated = await Promise.all(
    pendingMigrations.map((migration) =>
      applyMigration({
        db: db.client,
        project,
        migration,
        Migrations,
      })
    )
  );

  if (migrated.length === 0) {
    console.log('Database is up to date');
  } else {
    console.log(`Successfully migrated:\n ${migrated.map((m) => m.filename).join(',\n')}`);
  }

  return {
    success: true,
  };
}
