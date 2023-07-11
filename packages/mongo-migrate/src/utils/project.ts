import { ProjectGraphProjectNode } from '@nrwl/devkit';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Validates migrations initialized in project
 * @constraints Cannot use execution context like other utils as this is used by generators as well
 */
export const validateMigrationInitialization = (project: ProjectGraphProjectNode) => {
  const workspaceConfigPath = 'migration.config.ts';
  const projectConfigPath = join(project.data.root, 'migration.config.ts');
  if (!existsSync(workspaceConfigPath) && !existsSync(projectConfigPath)) {
    throw new Error('Migrations not initialized in project. Please run the init generator first.');
  }

  const migrationDirectory = project.data['migrationDirectory'] as string | undefined;
  if (!migrationDirectory) {
    throw new Error('Could not find migrationDirectory in project configuration. Have you initialized migrations?');
  }

  const migrationDirectoryPath = join(project.data.root, migrationDirectory);
  if (!existsSync(migrationDirectoryPath)) {
    throw new Error('Could not find migrations directory. Have you initialized migrations?');
  }
};
