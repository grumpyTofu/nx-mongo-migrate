import { Todo } from '../src';

export default {
  // The nx-mongo-migrate engine passes the full db connection as a param for easy access if needed
  // async up(db: mongoose.Connection['db']) {
  async up() {
    const seedTodos = Array.from({ length: 10 }).map(
      (_, i) =>
        new Todo({
          title: `Test Todo ${i + 1}`,
          value: `complete task ${i + 1}`,
        })
    );

    Todo.insertMany(seedTodos);

    /* HINT:
    By default, Nx-mongo-migrate will track migrations as soon as they succeed by the file hash.
    This is helpful for actual production systems, but can be quite annoying for debugging your migration scripts
    to work around this, you can throw an error to purposely cause the migration to fail for debugging like so:
    the "break-glass" option is to manually modify the migrations in mongodb, but this is NOT recommended
    */
    // throw new Error('debug');
  },
  async down() {
    Todo.remove();
  },
};
