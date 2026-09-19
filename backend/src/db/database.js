const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "railreserve.db");

let db;

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
  if (!db) {
    throw new Error("Database has not been initialized.");
  }
  return db;
}

function initializeDatabase() {
  ensureDataDir();
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT NOT NULL UNIQUE,
      train_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pnr TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      passenger_name TEXT NOT NULL,
      train_number TEXT NOT NULL,
      train_name TEXT NOT NULL,
      class_type TEXT NOT NULL,
      journey_date TEXT NOT NULL,
      source_station TEXT NOT NULL,
      destination_station TEXT NOT NULL,
      booking_status TEXT NOT NULL DEFAULT 'CONFIRMED',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (train_number) REFERENCES trains(train_number)
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_pnr ON reservations(pnr);
    CREATE INDEX IF NOT EXISTS idx_reservations_train_number ON reservations(train_number);
    CREATE INDEX IF NOT EXISTS idx_reservations_journey_date ON reservations(journey_date);
    CREATE INDEX IF NOT EXISTS idx_reservations_passenger ON reservations(passenger_name);
    CREATE INDEX IF NOT EXISTS idx_trains_number ON trains(train_number);
  `);

  seedIfEmpty();
  return db;
}

function seedIfEmpty() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync("Demo@123", 12);
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
      "demo",
      passwordHash
    );
  }

  const trainCount = db.prepare("SELECT COUNT(*) AS count FROM trains").get().count;
  if (trainCount === 0) {
    const insertTrain = db.prepare(
      "INSERT INTO trains (train_number, train_name) VALUES (?, ?)"
    );
    const insertMany = db.transaction((trains) => {
      for (const train of trains) {
        insertTrain.run(train.train_number, train.train_name);
      }
    });
    insertMany(SAMPLE_TRAINS);
  }
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  DB_PATH,
  SAMPLE_TRAINS,
  initializeDatabase,
  getDb,
  closeDatabase,
};
