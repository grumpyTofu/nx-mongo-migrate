<h1 align="center">Nx Mongo Migrate</h1>

<p align="center">
  Nx plugin to manage database migrations for mongodb using mongoose
  <br>
  <br>
  <a href="https://github.com/grumpyTofu/nx-mongo-migrate/issues/new?template=bug_report.md">Report bug</a>
  ·
  <a href="https://github.com/grumpyTofu/nx-mongo-migrate/issues/new?template=feature_request.md&labels=feature">Request feature</a>
</p>
<br />

[![npm version](https://badge.fury.io/js/nx-mongo-migrate.svg)](https://badge.fury.io/js/nx-mongo-migrate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br />

## Quick Start

This library is a custom Nx plugin that manages database migrations for any project using mongoose. The code was originally based on the popular migrate-mongo library but completely re-written in typescript and specifically for Nx workspaces.

- simple to use
- easily write scripts for automated data management via CI/CD pipelines
- supports any NoSQL database that supports Mongoose

**Attention**: this is a `node.js` library. It is supposed to be used as a backend/server-side library and will definitely not work within a browser.

<br />

## Installation

<br />

npm:
```bash
npm install nx-mongo-migrate --save-dev
```

yarn:
```bash
yarn add -D nx-mongo-migrate
```

pnpm:
```bash
pnpm add -D nx-mongo-migrate
```

<br />

## How to Use Nx-Mongo-Migrate

<br />

### **How to -** Initialize Migrations for a New Project:
The first step in managing data for a specific project is to initialize migrations for the project. This can be done by 
1. right-clicking and selecting *'Nx generate...'*
2. Select the *'nx-mongo-migrate - init'* option
3. Follow the generator prompt

This should create a migrations directory in the desired project along with modifying the project configuration to include new migration commands for performing the actual management of database migrations

<br />

---

<br />

### **How to -** Create Migrations:
The second step in managing data for a specific project is to create a new migration for the project. This can be done by 
1. right-clicking and selecting *'Nx generate...'*
2. Select the *'nx-mongo-migrate - create'* option
3. Follow the generator prompt

This should generate a new database migration file which contains two methods. The first is the *'up'* method which is responsible for applying the specified database changes. The second method is the *'down'* method which is resopnsible for reversing the changes created in the *'up'* method.

**It is strongly recommended that all migrations be written in an idempotent manner**

<br />

---

<br />

### **How to -** Apply Migrations:
After creating a new migration, the next step is to apply the migration to the database. This can be done by running the `nx mongo-migrate-up <project>` command. The database migration engine will keep track of your migrations, including the contents of each migration file to ensure that your database stays in sync.

<br />

---

<br />

### **How to -** Revert Migrations:
It may be neccessary to revert a migration from time to time. This can be done by running the `nx mongo-migrate-down <project>` command. This command will revert the last applied migration for the project.

<br />

---

<br />

### **How to -** Get Migration Status:
Nx mongo-migrate contains a convenience function that will display the most recent migration for a specific project. This can be done by running the `nx mongo-migrate-status <project>` command.

<br />

---

<br />

## Additional Considerations

All migrations are applied linearly in time, each marked with a timestamp in both the name and database. This means that in order to apply and revert migrations successfully all migrations must be reverted and applied linearly in time as well. This ordinarily will not cause issues as the migration engine will handle this for you, but any manual modification to the migration database collection could cause migrations to fall out of sync. 

This is why it is strongly recommended to **NEVER** manually modify the database collection unless you are absolutely sure what you are doing as doing so may result in irrepairable damage!

The database migration engine does track migration history and migration contents. Therefore, it only runs migrations once. However, as a best practice, it is still strongly recommended to write migrations in an idempotent manner. This is especially important when writing migrations for collections where data already exists that is not managed by mongo-migrate.

The database migration engine also tracks the contents of each database migration. Therefore, if any of the migration scripts which have already been applied get modified, then any future migrations will fail. This is a safe guard to protect the integrity of the database.