import {
  ExecutorContext,
  joinPathFragments,
  addDependenciesToPackageJson,
  removeDependenciesFromPackageJson,
  Tree,
} from '@nrwl/devkit';
import { sync } from 'glob';
import { createHash } from 'crypto';

export function getProjectRoot(context: ExecutorContext): string {
  if (context.projectName) {
    return joinPathFragments(context.root, projectRelativePath(context));
  }
  return context.root;
}

export function projectRelativePath({
  projectName,
  workspace,
}: ExecutorContext): string {
  if (!projectName) throw `Project ${projectName} not found. Check Nx config`;
  return workspace.projects[projectName].root;
}

export function getWorkspaceRoot(context: ExecutorContext): string {
  return context.root;
}

export function updateDependencies(
  host: Tree,
  deps: Record<string, string>,
  devDeps: Record<string, string>
) {
  // Make sure we don't have dependency duplicates
  const depKeys = Object.keys(deps);
  const devDepKeys = Object.keys(devDeps);
  removeDependenciesFromPackageJson(host, depKeys, devDepKeys);
  return addDependenciesToPackageJson(host, deps, devDeps);
}

export const getMigrations = (migrationDirectory: string) =>
  sync(`${migrationDirectory}/*-migration.{ts,js}`).sort((a: string, b: string) => {
    const [timestampA] = a.split('-');
    const [timestampB] = b.split('-');

    return parseInt(timestampA) - parseInt(timestampB);
  });

export const hashFile = (file: Buffer) => {
  const hash = createHash('sha256');
  hash.update(file);
  return hash.digest('hex');
};
