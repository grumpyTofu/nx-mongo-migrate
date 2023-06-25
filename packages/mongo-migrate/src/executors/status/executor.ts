import { getNxProject } from '../../utils/nx';
import { StatusExecutorSchema } from './schema';

import { join } from 'path';
import { validateMigrationInitialization } from '../../utils/project';
import mongoose from 'mongoose';
import { ExecutorContext } from '@nrwl/devkit';
import { migrationSchema } from '../../data/migration.schema';
import { Database } from '../../data/db';

export default async function runExecutor(
  options: StatusExecutorSchema,
  context: ExecutorContext
) {
  const project = getNxProject(context.projectName);

  validateMigrationInitialization(project);

  const configImport = await import(join(context.root, 'migration.config'));
  const config = await configImport.default();
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
