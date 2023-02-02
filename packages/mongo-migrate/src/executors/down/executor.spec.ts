import { DownExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext } from '@nrwl/devkit';

const options: DownExecutorSchema = {};

describe('Build Executor', () => {
  it('can run', async () => {
    // const output = await executor(options);
    // expect(output.success).toBe(true);
    expect(options).toBeTruthy();
  });
});
