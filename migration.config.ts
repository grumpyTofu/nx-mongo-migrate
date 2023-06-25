import mongoose from 'mongoose';
export interface MigrationConfig extends mongoose.ConnectOptions {
  dbUri: string;
  migrationCollection: string;
}

export type MigrationConfigFactory = () =>
  | MigrationConfig
  | Promise<MigrationConfig>;

/* IMPORTANT NOTE: 
Your config will look slightly different
Your repo should be able to import MigrationConfigFactory type directly from nx-mongo-migrate
I am faking the type for demo purposes below
This config works locally with the example package in this repo for testing purposes
*/

const config: MigrationConfigFactory = () => ({
  dbUri: 'mongodb://localhost:27017',
  migrationCollection: 'migrations', // default
  dbName: 'nx-mongo-migrate'
});

export default config;
