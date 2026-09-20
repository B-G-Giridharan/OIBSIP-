const express = require("express");
const { getDb } = require("../db/database");
const { requireAuth } = require("../middleware/auth");
const { generatePnr } = require("../utils/pnr");
const {
  validateReservationPayload,
  validatePnr,
} = require("../validation/reservation");
const { asyncHandler } = require("../middleware/errorHandler");

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

router.get("/", asyncHandler(async (req, res) => {
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
    clauses.push("passenger_name LIKE ?");
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

  const [rows] = await getDb().execute(
    `SELECT pnr, passenger_name, train_number, train_name, class_type,
            journey_date, source_station, destination_station, booking_status, created_at
     FROM reservations
     WHERE ${clauses.join(" AND ")}
     ORDER BY created_at DESC`,
    params
  );

  res.json({ reservations: rows.map(mapReservation) });
}));

router.get("/summary", asyncHandler(async (req, res) => {
  const db = getDb();
  const [totalRows] = await db.execute(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN booking_status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed,
       SUM(CASE WHEN booking_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
     FROM reservations
     WHERE user_id = ?`,
    [req.user.id]
  );
  const totals = totalRows[0];

  const [recent] = await db.execute(
    `SELECT pnr, passenger_name, train_number, train_name, class_type,
            journey_date, source_station, destination_station, booking_status, created_at
     FROM reservations
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [req.user.id]
  );

  res.json({
    totals: {
      total: Number(totals.total) || 0,
      confirmed: Number(totals.confirmed) || 0,
      cancelled: Number(totals.cancelled) || 0,
    },
    recent: recent.map(mapReservation),
  });
}));

router.get("/:pnr", asyncHandler(async (req, res) => {
  const { isValid, value, error } = validatePnr(req.params.pnr);
  if (!isValid) {
    return res.status(400).json({ message: error });
  }

  const [rows] = await getDb().execute(
    `SELECT pnr, passenger_name, train_number, train_name, class_type,
            journey_date, source_station, destination_station, booking_status, created_at
     FROM reservations
     WHERE pnr = ? AND user_id = ?`,
    [value, req.user.id]
  );
  const row = rows[0];

  if (!row) {
    return res.status(404).json({ message: "No booking found for this PNR." });
  }

  return res.json({ reservation: mapReservation(row) });
}));

router.post("/", asyncHandler(async (req, res) => {
  const { isValid, errors, value } = validateReservationPayload(req.body);
  if (!isValid) {
    return res.status(400).json({ message: "Please correct the highlighted fields.", errors });
  }

  const db = getDb();
  const [trains] = await db.execute(
    "SELECT train_number, train_name FROM trains WHERE train_number = ?",
    [value.trainNumber]
  );
  const train = trains[0];

  if (!train) {
    return res.status(400).json({
      message: "Train not found for this train number.",
      errors: { trainNumber: "Train not found for this train number." },
    });
  }

  try {
    const pnr = await generatePnr(async (candidate) => {
      const [matches] = await db.execute(
        "SELECT 1 FROM reservations WHERE pnr = ?",
        [candidate]
      );
      return matches.length > 0;
    });

    await db.execute(
      `INSERT INTO reservations (
         pnr, user_id, passenger_name, train_number, train_name, class_type,
         journey_date, source_station, destination_station, booking_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [
        pnr,
        req.user.id,
        value.passengerName,
        train.train_number,
        train.train_name,
        value.classType,
        value.journeyDate,
        value.sourceStation,
        value.destinationStation,
      ]
    );

    const [rows] = await db.execute(
      `SELECT pnr, passenger_name, train_number, train_name, class_type,
              journey_date, source_station, destination_station, booking_status, created_at
       FROM reservations WHERE pnr = ?`,
      [pnr]
    );
    const row = rows[0];

    return res.status(201).json({
      message: "Ticket booked successfully.",
      reservation: mapReservation(row),
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" && String(error.message).includes("pnr")) {
      return res.status(409).json({
        message: "A duplicate PNR was generated. Please try booking again.",
      });
    }
    throw error;
  }
}));

router.delete("/:pnr", asyncHandler(async (req, res) => {
  const { isValid, value, error } = validatePnr(req.params.pnr);
  if (!isValid) {
    return res.status(400).json({ message: error });
  }

  const db = getDb();
  const [existingRows] = await db.execute(
    "SELECT pnr, booking_status FROM reservations WHERE pnr = ? AND user_id = ?",
    [value, req.user.id]
  );
  const existing = existingRows[0];

  if (!existing) {
    return res.status(404).json({ message: "No booking found for this PNR." });
  }

  if (existing.booking_status === "CANCELLED") {
    return res.status(409).json({ message: "This reservation is already cancelled." });
  }

  await db.execute(
    "UPDATE reservations SET booking_status = 'CANCELLED' WHERE pnr = ? AND user_id = ?",
    [value, req.user.id]
  );

  const [rows] = await db.execute(
    `SELECT pnr, passenger_name, train_number, train_name, class_type,
            journey_date, source_station, destination_station, booking_status, created_at
     FROM reservations WHERE pnr = ? AND user_id = ?`,
    [value, req.user.id]
  );
  const row = rows[0];

  return res.json({
    message: "Reservation cancelled successfully.",
    reservation: mapReservation(row),
  });
}));

module.exports = router;
