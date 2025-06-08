import { DatabaseConnection } from '../lib/connection';
import { runMigrations, rollbackMigration } from '../migrations';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const migrationName = args[1];

  const db = DatabaseConnection.getInstance();

  try {
    await db.initialize();

    switch (command) {
      case 'up':
        console.log('Running migrations...');
        await runMigrations(db.getPool());
        console.log('Migrations completed successfully');
        break;

      case 'down':
        if (!migrationName) {
          console.error('Migration name is required for rollback');
          process.exit(1);
        }
        console.log(`Rolling back migration: ${migrationName}`);
        await rollbackMigration(db.getPool(), migrationName);
        console.log('Rollback completed successfully');
        break;

      default:
        console.error('Invalid command. Use "up" or "down"');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main().catch(console.error); 