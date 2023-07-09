import { MigrationConfigFactory } from './packages/mongo-migrate';

const config: MigrationConfigFactory = () => ({
  dbUri: 'mongodb://localhost:27017',
  migrationCollection: 'migrations', // default
  dbName: 'nx-mongo-migrate',
});

export default config;
