import { StatusExecutorSchema } from './schema';

import { join } from 'path';
import mongoose from 'mongoose';
import { ExecutorContext } from '@nrwl/devkit';
import { migrationSchema, Database } from '../../data';
import {
  getNxProject,
  getMigrationConfigPath,
  importMigrationConfigAsync,
  validateMigrationInitialization,
} from '../../utils';

export default async function runExecutor(
  options: StatusExecutorSchema,
  context: ExecutorContext
) {
  const project = getNxProject(context.projectName);

  validateMigrationInitialization(project);

  const configImportPath = getMigrationConfigPath(context);
  const config = await importMigrationConfigAsync(context, configImportPath);
  const db = new Database(config);
  await db.connect();

  const Migration = mongoose.model(
    'Migration',
    migrationSchema,
    db.migrationCollection
  );
  const latest = await Migration.findOne(
    { project: project.name },
    {},
    { sort: { dateApplied: -1 } }
  );
  if (!latest) {
    console.log('No migrations found');
    return {
      success: true,
    };
  }

  console.log(`Latest migration:`);
  console.log(`\tId: ${latest.id}`);
  console.log(
    `\tFilename: ${join(
      project.data.root,
      project.data['migrationDirectory'],
      latest.filename
    )}`
  );
  console.log(`\tHash: ${latest.hash}`);
  console.log(`\tDate Applied: ${latest.dateApplied}`);

  return {
    success: true,
  };
}
