import { ProjectGraphProjectNode } from '@nrwl/devkit';
import { existsSync } from 'fs';
import * as path from 'path';

export const validateMigrationInitialization = (project: ProjectGraphProjectNode) => {
  if (!existsSync('migration.config.ts')) throw 'Migrations not initialized in project. Please run the init generator first.';

  const migrationDirectory = project.data['migrationDirectory'] as string | undefined;
  if (!migrationDirectory) throw 'Could not find migrationDirectory in project configuration. Have you initialized migrations?';

  if (!existsSync(path.join(project.data.root, migrationDirectory)))
    throw 'Could not find migrations directory. Have you initialized migrations?';
};
