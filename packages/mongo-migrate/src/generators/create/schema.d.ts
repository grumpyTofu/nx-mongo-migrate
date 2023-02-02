export interface CreateMigrationGeneratorSchema {
  targetProject: string;
  targetSchema: string;
  schemaless: boolean;
}
