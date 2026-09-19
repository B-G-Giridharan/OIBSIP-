const express = require("express");
const { getDb } = require("../db/database");
const { requireAuth } = require("../middleware/auth");
const { generatePnr } = require("../utils/pnr");
const {
  validateReservationPayload,
  validatePnr,
} = require("../validation/reservation");

const router = express.Router();

router.use(requireAuth);

function mapReservation(row) {
  return {
    pnr: row.pnr,
    passengerName: row.passenger_name,
    trainNumber: row.train_number,
    trainName: row.train_name,
    classType: row.class_type,
    journeyDate: row.journey_date,
    sourceStation: row.source_station,
    destinationStation: row.destination_station,
    bookingStatus: row.booking_status,
    createdAt: row.created_at,
  };
}

router.get("/", (req, res) => {
  const pnr = String(req.query.pnr ?? "").trim();
  const passenger = String(req.query.passenger ?? "").trim();
  const trainNumber = String(req.query.trainNumber ?? "").trim();
  const journeyDate = String(req.query.journeyDate ?? "").trim();

  const clauses = ["user_id = ?"];
  const params = [req.user.id];

  if (pnr) {
    clauses.push("pnr LIKE ?");
    params.push(`%${pnr.toUpperCase()}%`);
  }
  if (passenger) {
    clauses.push("passenger_name LIKE ? COLLATE NOCASE");
    params.push(`%${passenger}%`);
  }
  if (trainNumber) {
    clauses.push("train_number LIKE ?");
    params.push(`%${trainNumber}%`);
  }
  if (journeyDate) {
    clauses.push("journey_date = ?");
    params.push(journeyDate);
  }

  const rows = getDb()
    .prepare(
      `SELECT pnr, passenger_name, train_number, train_name, class_type,
              journey_date, source_station, destination_station, booking_status, created_at
       FROM reservations
       WHERE ${clauses.join(" AND ")}
       ORDER BY datetime(created_at) DESC`
    )
    .all(...params);

  res.json({ reservations: rows.map(mapReservation) });
});

router.get("/summary", (req, res) => {
  const db = getDb();
  const totals = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN booking_status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed,
         SUM(CASE WHEN booking_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
       FROM reservations
       WHERE user_id = ?`
    )
    .get(req.user.id);

  const recent = db
    .prepare(
      `SELECT pnr, passenger_name, train_number, train_name, class_type,
              journey_date, source_station, destination_station, booking_status, created_at
       FROM reservations
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT 5`
    )
    .all(req.user.id);

  res.json({
    totals: {
      total: totals.total || 0,
      confirmed: totals.confirmed || 0,
      cancelled: totals.cancelled || 0,
    },
    recent: recent.map(mapReservation),
  });
});

router.get("/:pnr", (req, res) => {
  const { isValid, value, error } = validatePnr(req.params.pnr);
  if (!isValid) {
    return res.status(400).json({ message: error });
  }

  const row = getDb()
    .prepare(
      `SELECT pnr, passenger_name, train_number, train_name, class_type,
              journey_date, source_station, destination_station, booking_status, created_at
       FROM reservations
       WHERE pnr = ? AND user_id = ?`
    )
    .get(value, req.user.id);

  if (!row) {
    return res.status(404).json({ message: "No booking found for this PNR." });
  }

  return res.json({ reservation: mapReservation(row) });
});

router.post("/", (req, res) => {
  const { isValid, errors, value } = validateReservationPayload(req.body);
  if (!isValid) {
    return res.status(400).json({ message: "Please correct the highlighted fields.", errors });
  }

  const db = getDb();
  const train = db
    .prepare("SELECT train_number, train_name FROM trains WHERE train_number = ?")
    .get(value.trainNumber);

  if (!train) {
    return res.status(400).json({
      message: "Train not found for this train number.",
      errors: { trainNumber: "Train not found for this train number." },
    });
  }

  try {
    const pnr = generatePnr((candidate) =>
      Boolean(db.prepare("SELECT 1 FROM reservations WHERE pnr = ?").get(candidate))
    );

    db.prepare(
      `INSERT INTO reservations (
         pnr, user_id, passenger_name, train_number, train_name, class_type,
         journey_date, source_station, destination_station, booking_status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`
    ).run(
      pnr,
      req.user.id,
      value.passengerName,
      train.train_number,
      train.train_name,
      value.classType,
      value.journeyDate,
      value.sourceStation,
      value.destinationStation
    );

    const row = db
      .prepare(
        `SELECT pnr, passenger_name, train_number, train_name, class_type,
                journey_date, source_station, destination_station, booking_status, created_at
         FROM reservations WHERE pnr = ?`
      )
      .get(pnr);

    return res.status(201).json({
      message: "Ticket booked successfully.",
      reservation: mapReservation(row),
    });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed: reservations.pnr")) {
      return res.status(409).json({
        message: "A duplicate PNR was generated. Please try booking again.",
      });
    }
    throw error;
  }
});

router.delete("/:pnr", (req, res) => {
  const { isValid, value, error } = validatePnr(req.params.pnr);
  if (!isValid) {
    return res.status(400).json({ message: error });
  }

  const db = getDb();
  const existing = db
    .prepare(
      "SELECT pnr, booking_status FROM reservations WHERE pnr = ? AND user_id = ?"
    )
    .get(value, req.user.id);

  if (!existing) {
    return res.status(404).json({ message: "No booking found for this PNR." });
  }

  if (existing.booking_status === "CANCELLED") {
    return res.status(409).json({ message: "This reservation is already cancelled." });
  }

  db.prepare(
    "UPDATE reservations SET booking_status = 'CANCELLED' WHERE pnr = ? AND user_id = ?"
  ).run(value, req.user.id);

  const row = db
    .prepare(
      `SELECT pnr, passenger_name, train_number, train_name, class_type,
              journey_date, source_station, destination_station, booking_status, created_at
       FROM reservations WHERE pnr = ? AND user_id = ?`
    )
    .get(value, req.user.id);

  return res.json({
    message: "Reservation cancelled successfully.",
    reservation: mapReservation(row),
  });
});

module.exports = router;
