import mongoose from 'mongoose';

export interface MigrationConfig extends mongoose.ConnectOptions {
  dbUri: string;
  migrationCollection: string;
}

export class Database {
  dbUri: string;
  config: mongoose.ConnectOptions;
  migrationCollection: string;

  mongoose?: mongoose.Mongoose;
  connection?: mongoose.Connection;
  client?: mongoose.Connection['db'];

  constructor({ dbUri, migrationCollection = 'migrations', ...config }: MigrationConfig) {
    if (!dbUri) throw 'Database connection string was not defined.';

    this.dbUri = dbUri;
    this.migrationCollection = migrationCollection;
    this.config = config;
  }

  async connect() {
    mongoose.set('strictQuery', false);
    this.mongoose = await mongoose.connect(this.dbUri, this.config);
    this.connection = this.mongoose.connection;
    this.client = this.connection.db;
  }
}
