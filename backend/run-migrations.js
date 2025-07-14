const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Create Sequelize instance with the same config as your app
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/database.sqlite',
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

async function runMigrations() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Read all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort to run in order

    console.log(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      
      try {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        console.log(`✓ Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`✗ Migration ${file} failed:`, error.message);
        // Continue with other migrations
      }
    }

    console.log('All migrations completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigrations(); 