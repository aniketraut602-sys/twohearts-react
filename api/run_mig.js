const { init } = require('./db/db');

try {
    console.log('Initializing database and running migrations...');
    init();
    console.log('Database initialized and migrations run successfully.');
} catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
}
