import { ExecutorContext, ProjectGraphProjectNode } from '@nrwl/devkit';
import { Database, MigrationDocument, migrationSchema } from '../../data';
import {
  getNxProject,
  validateMigrationInitialization,
  getMigrationConfigPath,
  getMigrations,
  hashFile,
  importMigrationAsync,
  importMigrationConfigAsync,
} from '../../utils';
import { UpExecutorSchema } from './schema';

import { basename, resolve } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';

const validateAppliedMigrations = async (
  migration: MigrationDocument,
  migrationPath: string
) => {
  if (!migrationPath) {
    throw new Error(`Migration file ${migration.filename} is missing`);
  }

  const file = readFileSync(migrationPath);
  const fileHash = hashFile(file);

  if (migration.hash !== fileHash) {
    throw new Error(`Migration ${migration.id} is out of sync`);
  }
};

interface ApplyMigrationArgs {
  db: mongoose.Connection['db'];
  project: ProjectGraphProjectNode;
  Migrations: mongoose.Model<MigrationDocument, object, object, object, never>;
  migrationPath: string;
  context: ExecutorContext;
}

const applyMigration = async ({
  db,
  project,
  Migrations,
  migrationPath,
  context
}: ApplyMigrationArgs) => {
  const migration = await importMigrationAsync(context, migrationPath);
  await migration.up(db);

  const filename = basename(migrationPath);
  const file = readFileSync(migrationPath);
  const hash = hashFile(file);

  return Migrations.create({
    project: project.name,
    filename,
    hash,
    dateApplied: new Date(),
  });
};

export default async function runExecutor(
  options: UpExecutorSchema,
  context: ExecutorContext
) {
  const project = getNxProject(context.projectName);

  validateMigrationInitialization(project);

  const configImportPath = getMigrationConfigPath(context);
  const config = await importMigrationConfigAsync(context, configImportPath);
  const db = new Database(config);
  await db.connect();

  const Migrations = mongoose.model<MigrationDocument>(
    'Migration',
    migrationSchema,
    db.migrationCollection
  );

  const migrationDirectory = resolve(
    context.root,
    project.data.root,
    project.data['migrationDirectory']
  );

  // get migrations from migrations directory, filter .gitkeep, and sort oldest to newest
  const migrations = getMigrations(migrationDirectory);

  if (migrations.length === 0) {
    console.error(
      'No migrations to apply. Try using the mongo-migrate generator first to create a new migration'
    );
    return { success: false };
  }

  const appliedMigrations = await Migrations.find(
    { project: project.name },
    { filename: 1, hash: 1 }
  );

  // check all applied migrations and ensure hashes match db - if not throw out of sync error
  await Promise.all(
    appliedMigrations.map((m) =>
      validateAppliedMigrations(
        m,
        migrations.find((name) => basename(name) === m.filename)
      )
    )
  );

  // apply migrations for all new files in order
  const pendingMigrations = migrations.filter(
    (file) => !appliedMigrations.find((m) => m.filename === basename(file))
  );

  const migrated = await Promise.all(
    pendingMigrations.map((migrationPath) =>
      applyMigration({
        db: db.client,
        project,
        migrationPath,
        Migrations,
        context
      })
    )
  );

  if (migrated.length === 0) {
    console.log('Database is up to date');
  } else {
    console.log(
      `Successfully migrated:\n ${migrated.map((m) => m.filename).join(',\n')}`
    );
  }

  return { success: true };
}
