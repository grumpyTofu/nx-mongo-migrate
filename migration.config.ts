import { MigrationConfigFactory } from './packages/mongo-migrate';

// import { MigrationConfigFactory } from 'nx-mongo-migrate';
/* IMPORTANT NOTE: 
Your config will look slightly different
Your repo should be able to import MigrationConfigFactory type directly from nx-mongo-migrate
I am faking the type for demo purposes below
This config works locally with the example package in this repo for testing purposes
*/

const config: MigrationConfigFactory = async (
  factory = () => ({
    dbUri: 'mongodb://localhost:27017',
    migrationCollection: 'migrations', // default
  })
) => await factory();

export default config;
