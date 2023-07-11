import {
  ExecutorContext,
  joinPathFragments,
  addDependenciesToPackageJson,
  removeDependenciesFromPackageJson,
  Tree,
} from '@nrwl/devkit';
import { sync } from 'glob';
import { createHash } from 'crypto';
import { join } from 'path';
import { existsSync } from 'fs';
// TODO: switch to swc when bundle becomes more mature
// import { transformFileSync, bundle } from '@swc/core';\

import requireFromString from 'require-from-string';
import { build } from 'esbuild';
import TsconfigPathsPlugin from '@esbuild-plugins/tsconfig-paths';

export const getWorkspaceRoot = (context: ExecutorContext) => context.root;

export function getProjectRoot(context: ExecutorContext): string {
  return context.projectName ? joinPathFragments(context.root, projectRelativePath(context)) : context.root;
}

export function projectRelativePath({ projectName, workspace }: ExecutorContext): string {
  if (!projectName) {
    throw new Error(`Project ${projectName} not found. Check Nx config`);
  }
  return workspace.projects[projectName].root;
}

export function updateDependencies(host: Tree, deps: Record<string, string>, devDeps: Record<string, string>) {
  // Make sure we don't have dependency duplicates
  const depKeys = Object.keys(deps);
  const devDepKeys = Object.keys(devDeps);
  removeDependenciesFromPackageJson(host, depKeys, devDepKeys);
  return addDependenciesToPackageJson(host, deps, devDeps);
}

export const hashFile = (file: Buffer) => {
  const hash = createHash('sha256');
  hash.update(file);
  return hash.digest('hex');
};

export const getMigrationConfigPath = (context: ExecutorContext) => {
  const projectConfig = join(getProjectRoot(context), 'migration.config.ts');
  const projectConfigExists = existsSync(projectConfig);
  if (projectConfigExists) return projectConfig;
  return join(getWorkspaceRoot(context), 'migration.config.ts');
};

export const importMigrationConfigAsync = async (context: ExecutorContext, path: string) => {
  const migrationConfig = await importTsModuleAsync(context, path);
  if (!migrationConfig) {
    throw new Error('Failed to load migration config. Please check your setup and try again.');
  }
  return migrationConfig.default();
};

export const importTsModuleAsync = async (context: ExecutorContext, path: string) => {
  const tsconfigBasePath = join(getWorkspaceRoot(context), 'tsconfig.base.json');
  const tsconfigProjectPath = join(getProjectRoot(context), 'tsconfig.migrations.json');

  if (!existsSync(tsconfigBasePath)) throw new Error('Missing tsconfig.base.json');
  if (!existsSync(tsconfigProjectPath)) throw new Error('Missing tsconfig.migrations.json');

  const { outputFiles } = await build({
    entryPoints: [path],
    bundle: true,
    platform: 'node',
    packages: 'external',
    tsconfig: tsconfigProjectPath,
    write: false,
    outdir: 'tmp',
    minify: true,
    plugins: [TsconfigPathsPlugin({ tsconfig: tsconfigBasePath })],
  });
  return requireFromString(outputFiles.shift().text);
};

export const getMigrations = (migrationDirectory: string) =>
  sync(`${migrationDirectory}/*-migration.{ts,js}`).sort((a: string, b: string) => {
    const [timestampA] = a.split('-');
    const [timestampB] = b.split('-');

    return parseInt(timestampA) - parseInt(timestampB);
  });

export const importMigrationAsync = async (context: ExecutorContext, path: string) => {
  const migrationImport = await importTsModuleAsync(context, path);
  if (!migrationImport.default) throw new Error('Malformed migration file');

  const migration = migrationImport.default;
  if (!migration.up || !migration.down) {
    throw new Error('Malformed migration file');
  }

  return migration;
};

// Saving for TODO: switch from esbuild to swc
// const bundleConfig: Partial<BundleInput> = {
//   entry: {
//     web: path,
//   },
//   options: {
//     jsc: {
//       parser: {
//         syntax: 'typescript',
//       },
//       target: 'esnext',
//       loose: false,
//       minify: {
//         compress: false,
//         mangle: false,
//       },
//       preserveAllComments: true,
//     },
//     module: {
//       type: 'commonjs',
//     },
//     minify: false,
//     isModule: true,
//   },
// };

// const { web } = await bundle(bundleConfig as never).catch((error) => {
//   console.log('An error occurred in SWC bundle.');
//   throw error;
// });
