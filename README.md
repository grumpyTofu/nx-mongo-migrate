# Nx-Mongo-Migrate

This library is a custom Nx plugin that manages database migrations for any project using mongoose.

---

## How to Use Nx-Mongo-Migrate

### **How to -** Initialize Migrations for a New Project:
The first step in managing data for a specific project is to initialize migrations for the project. This can be done by 
1. right-clicking and selecting *'Nx generate...'*
2. Select the *'nx-mongo-migrate - init'* option
3. Follow the generator prompt

This should create a migrations directory in the desired project along with modifying the project configuration to include new migration commands for performing the actual management of database migrations

---

### **How to -** Create Migrations:
The second step in managing data for a specific project is to create a new migration for the project. This can be done by 
1. right-clicking and selecting *'Nx generate...'*
2. Select the *'nx-mongo-migrate - create'* option
3. Follow the generator prompt

This should generate a new database migration file which contains two methods. The first is the *'up'* method which is responsible for applying the specified database changes. The second method is the *'down'* method which is resopnsible for reversing the changes created in the *'up'* method.

**It is strongly recommended that all migrations be written in an idempotent manner**

---

### **How to -** Apply Migrations:
After creating a new migration, the next step is to apply the migration to the database. This can be done by running the `nx mongo-migrate-up <project>` command. The database migration engine will keep track of your migrations, including the contents of each migration file to ensure that your database stays in sync.

---

### **How to -** Revert Migrations:
It may be neccessary to revert a migration from time to time. This can be done by running the `nx mongo-migrate-down <project>` command. This command will revert the last applied migration for the project.

---

### **How to -** Get Migration Status:
Nx mongo-migrate contains a convenience function that will display the most recent migration for a specific project. This can be done by running the `nx mongo-migrate-status <project>` command.

---

## Additional Considerations

- All migrations are applied linearly in time, each marked with a timestamp in both the name and database. This means that in order to apply and revert migrations successfully all migrations must be reverted and applied linearly in time as well. This ordinarily will not cause issues as the migration engine will handle this for you, but any manual modification to the migration database collection could cause migrations to fall out of sync. This is why it is strongly recommended to NEVER manually modify the database collection unless you are absolutely sure what you are doing as doing so may result in irrepairable damage!
- The database migration engine does track migration history and migration contents. Therefore, it only runs migrations once. However, as a best practice, it is still strongly recommended to write migrations in an idempotent manner. This is especially important when writing migrations for collections where data already exists that is not managed by mongo-migrate.