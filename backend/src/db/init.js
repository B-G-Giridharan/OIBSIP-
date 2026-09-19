const { initializeDatabase, DB_PATH, closeDatabase } = require("./database");

initializeDatabase();
console.log(`SQLite database initialized at: ${DB_PATH}`);
closeDatabase();
