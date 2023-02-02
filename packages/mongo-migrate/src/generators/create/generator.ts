import {
  formatFiles,
  generateFiles,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import { join } from 'path';

import { getNxProject } from '../../utils/nx';
import { validateMigrationInitialization } from '../../utils/project';
import { CreateMigrationGeneratorSchema } from './schema';

interface NormalizedSchema extends CreateMigrationGeneratorSchema {
  projectName: string;
  projectRoot: string;
  migrationDirectory: string;
  targetSchema: string;
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const now = new Date();
  const templateOptions = {
    ...options,
    ...names(options.projectName),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    schemaless: options.schemaless,
    template: '',
    timestamp: now.getTime(),
    targetSchema: options.targetSchema ? `${options.targetSchema}-` : '',
  };
  generateFiles(
    tree,
    join(__dirname, 'files'),
    join(options.projectRoot, options.migrationDirectory),
    templateOptions
  );
}

export default async function (
  tree: Tree,
  { targetProject, schemaless, targetSchema }: CreateMigrationGeneratorSchema
) {
  const project = getNxProject(targetProject);

  const root = project.data.root;

  validateMigrationInitialization(project);

  const migrationDirectory = project.data['migrationDirectory'];

  addFiles(tree, {
    projectName: targetProject,
    projectRoot: root,
    targetProject,
    targetSchema,
    migrationDirectory,
    schemaless,
  });

  await formatFiles(tree);
}
