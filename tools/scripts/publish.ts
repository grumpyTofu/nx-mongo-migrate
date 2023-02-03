import { readCachedProjectGraph } from '@nrwl/devkit';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const main = async () => {
  const { name } = await yargs(hideBin(process.argv))
    .option('name', {
      alias: 'n',
      description: 'The name of the project being deployed',
      type: 'string',
      demandOption: true,
    })
    .parse();

  const rootPath = process.cwd();

  const graph = readCachedProjectGraph();
  const project = graph.nodes[name];

  if (!project)
    throw `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`;

  const outputPath = path.join(
    rootPath,
    project.data?.targets?.build?.options?.outputPath
  );
  if (!outputPath)
    throw `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`;

  //   const config = '.npmrc';
  //   fs.cpSync(config, path.join(outputPath, config));
  process.chdir(outputPath);
  execSync(
    'echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > .npmrc'
  );
  execSync('yarn publish --non-interactive');
};

main().catch((error) => {
  console.error(chalk.bold.red('An error occurred during deployment', error));
  throw error;
});
