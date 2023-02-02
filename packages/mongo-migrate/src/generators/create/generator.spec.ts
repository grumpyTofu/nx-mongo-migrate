import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { CreateMigrationGeneratorSchema } from './schema';

describe('mongo-migrate generator', () => {
  let appTree: Tree;
  const options: CreateMigrationGeneratorSchema = {
    targetProject: 'test',
    schemaless: false,
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
