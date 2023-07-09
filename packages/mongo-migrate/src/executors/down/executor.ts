import { ExecutorContext } from '@nrwl/devkit';
import { Database, MigrationDocument, migrationSchema } from '../../data';
import {
  getNxProject,
  validateMigrationInitialization,
  getMigrationConfigPath,
  hashFile,
  importMigrationConfigAsync,
  importMigrationAsync,
} from '../../utils';
import { DownExecutorSchema } from './schema';

import { join } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';

export default async function runExecutor(
  options: DownExecutorSchema,
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

  const migrationDirectory = join(
    project.data.root,
    project.data['migrationDirectory']
  );

  const latest = await Migrations.findOne(
    { project: project.name },
    { filename: 1, hash: 1 },
    { sort: { dateApplied: -1 } }
  );

  if (!latest) {
    console.log('No migrations available to downgrade');
    return { success: true };
  }

  // get migration file associated with latest migration
  const latestMigrationFilePath = join(migrationDirectory, latest.filename);
  const file = readFileSync(latestMigrationFilePath);
  const fileHash = hashFile(file);

  // validate file hash
  if (latest.hash !== fileHash) {
    throw new Error(
      'Failure to downgrade: Previous migration has been altered since last upgrade. Manual intervention is required'
    );
  }

  // downgrade
  const migration = await importMigrationAsync(context, latestMigrationFilePath);
  await migration.down(db.client);

  // remove migration from database
  await Migrations.findByIdAndDelete(latest.id);

  const newLatest = await Migrations.findOne(
    { project: project.name },
    { filename: 1, hash: 1 },
    { sort: { dateApplied: -1 } }
  );

  if (newLatest) {
    console.log(
      `Successfully downgraded ${project.name} to migration ${newLatest.id} applied on ${newLatest.dateApplied}`
    );
  } else {
    console.log(`Successfully downgraded all migrations for ${project.name}`);
  }

  return { success: true };
}
