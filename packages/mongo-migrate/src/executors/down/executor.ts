import { ExecutorContext } from '@nrwl/devkit';
import { Database } from '../../data/db';
import { getNxProject } from '../../utils/nx';
import { validateMigrationInitialization } from '../../utils/project';
import { DownExecutorSchema } from './schema';

import { join } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import {
  MigrationDocument,
  migrationSchema,
} from '../../data/migration.schema';
import { getMigrationConfigPath, hashFile } from '../../utils/common';

export default async function runExecutor(
  options: DownExecutorSchema,
  context: ExecutorContext
) {
  const project = getNxProject(context.projectName);

  validateMigrationInitialization(project);

  const configImport = await import(getMigrationConfigPath(context, project.name));
  const config = await configImport.default();
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
  if (latest.hash !== fileHash)
    throw 'Failure to downgrade: Previous migration has been altered since last upgrade. Manual intervention is required';

  // downgrade
  const migrationImport = await import(latestMigrationFilePath);

  if (!migrationImport.default) throw 'Malformed migration file';
  const migrationConfig = migrationImport.default;

  if (!migrationConfig.down) throw 'Malformed migration file';
  await migrationConfig.down(db.client);

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

  return {
    success: true,
  };
}
