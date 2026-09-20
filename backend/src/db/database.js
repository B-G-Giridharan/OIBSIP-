const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

let pool;

const SAMPLE_TRAINS = [
  { train_number: "12601", train_name: "Chennai - Mumbai Mail" },
  { train_number: "12602", train_name: "Mumbai - Chennai Express" },
  { train_number: "12623", train_name: "Chennai - Hyderabad Express" },
  { train_number: "12624", train_name: "Hyderabad - Chennai Express" },
  { train_number: "12671", train_name: "Chennai - Mangaluru Express" },
  { train_number: "12951", train_name: "Mumbai Rajdhani Express" },
  { train_number: "12007", train_name: "Chennai Shatabdi Express" },
  { train_number: "12245", train_name: "Howrah Duronto Express" },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDb() {
  if (!pool) {
    throw new Error("Database has not been initialized.");
  }
  return pool;
}

async function initializeDatabase() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "train_reservation",
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
    multipleStatements: true,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT NOT NULL AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_users_username (username)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS trains (
      id BIGINT NOT NULL AUTO_INCREMENT,
      train_number VARCHAR(32) NOT NULL,
      train_name VARCHAR(255) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uk_trains_train_number (train_number)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS reservations (
      id BIGINT NOT NULL AUTO_INCREMENT,
      pnr VARCHAR(32) NOT NULL,
      user_id BIGINT NOT NULL,
      passenger_name VARCHAR(255) NOT NULL,
      train_number VARCHAR(32) NOT NULL,
      train_name VARCHAR(255) NOT NULL,
      class_type VARCHAR(64) NOT NULL,
      journey_date DATE NOT NULL,
      source_station VARCHAR(255) NOT NULL,
      destination_station VARCHAR(255) NOT NULL,
      booking_status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_reservations_pnr (pnr),
      KEY idx_reservations_user_id (user_id),
      KEY idx_reservations_train_number (train_number),
      KEY idx_reservations_journey_date (journey_date),
      KEY idx_reservations_passenger (passenger_name),
      CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_reservations_train FOREIGN KEY (train_number) REFERENCES trains(train_number)
    ) ENGINE=InnoDB;
  `);

  await seedIfEmpty();
  return pool;
}

async function seedIfEmpty() {
  const [userRows] = await pool.execute("SELECT COUNT(*) AS count FROM users");
  if (Number(userRows[0].count) === 0) {
    const passwordHash = bcrypt.hashSync("Demo@123", 12);
    await pool.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
      "demo",
      passwordHash
    ]);
  }

  const [trainRows] = await pool.execute("SELECT COUNT(*) AS count FROM trains");
  if (Number(trainRows[0].count) === 0) {
    for (const train of SAMPLE_TRAINS) {
      await pool.execute(
        "INSERT INTO trains (train_number, train_name) VALUES (?, ?)",
        [train.train_number, train.train_name]
      );
    }
  }
}

async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  SAMPLE_TRAINS,
  initializeDatabase,
  getDb,
  closeDatabase,
};
