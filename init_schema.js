const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = './data/twohearts.db';
console.log(`Opening database at ${dbPath}`);
const db = new Database(dbPath);

const schemaPath = path.join(__dirname, 'db', 'schema.sql');
console.log(`Reading schema from ${schemaPath}`);
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Executing schema...');
db.exec(schema);
console.log('Schema applied successfully');
