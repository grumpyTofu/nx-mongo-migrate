import { formatFiles, generateFiles, names, Tree, updateProjectConfiguration, updateJson } from '@nrwl/devkit';
import { readFileSync } from 'fs';
import { join } from 'path';

import { getNxProject } from '../../utils/nx';
import { InitGeneratorSchema } from './schema';

interface NormalizedSchema extends InitGeneratorSchema {
  projectName: string;
}

const addFiles = (tree: Tree, options: NormalizedSchema) => {
  const now = new Date();
  const templateOptions = {
    ...options,
    ...names(options.projectName),
    offsetFromRoot: '',
    template: '',
    timestamp: now.getTime(),
  };
  if (options.createAppMigrationConfig) {
    generateFiles(tree, join(__dirname, 'files'), `apps/${options.projectName}`, templateOptions);
  } else {
    generateFiles(tree, join(__dirname, 'files'), '', templateOptions);
  }

  generateFiles(tree, join(__dirname, 'projectFiles'), `apps/${options.projectName}`, templateOptions);
};

export default async function (
  tree: Tree,
  { targetProject, migrationDirectory = 'migrations', createAppMigrationConfig = false }: InitGeneratorSchema
) {
  const project = getNxProject(targetProject);

  const root = project.data.root;

  const projectConfigFile = readFileSync(join(root, 'project.json'), {
    encoding: 'utf-8',
  });
  const projectConfig = JSON.parse(projectConfigFile);

  const migrationOptions = {
    migrationDirectory,
  };

  updateProjectConfiguration(tree, project.name, {
    ...projectConfig,
    root,
    migrationDirectory,
    targets: {
      ...projectConfig.targets,
      'migrate-up': {
        executor: 'nx-mongo-migrate:up',
        options: migrationOptions,
      },
      'migrate-down': {
        executor: 'nx-mongo-migrate:down',
        options: migrationOptions,
      },
      'migrate-status': {
        executor: 'nx-mongo-migrate:status',
        options: migrationOptions,
      },
    },
  });

  addFiles(tree, {
    projectName: project.name,
    targetProject,
    migrationDirectory,
    createAppMigrationConfig,
  });

  updateJson(tree, join(root, 'tsconfig.json'), (tsconfig) => {
    const projectMigrationTsconfig = './tsconfig.migrations.json';
    const projectMigrationTsconfigExists = !!tsconfig.references.find((r: any) => r.path === projectMigrationTsconfig);
    if (projectMigrationTsconfigExists) return tsconfig;
    return {
      ...tsconfig,
      references: [
        ...tsconfig.references,
        {
          path: projectMigrationTsconfig,
        },
      ],
    };
  });

  tree.write(`${join(root, migrationDirectory)}/.gitkeep`, '');

  await formatFiles(tree);
}
