const express = require("express");
const { getDb } = require("../db/database");
const { requireAuth } = require("../middleware/auth");
const { TRAIN_NUMBER_PATTERN } = require("../validation/reservation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.use(requireAuth);

router.get("/", asyncHandler(async (_req, res) => {
  const [trains] = await getDb().execute(
    "SELECT train_number, train_name FROM trains ORDER BY train_number"
  );
  res.json({ trains });
}));

router.get("/:trainNumber", asyncHandler(async (req, res) => {
  const trainNumber = String(req.params.trainNumber ?? "").trim();

  if (!TRAIN_NUMBER_PATTERN.test(trainNumber)) {
    return res.status(400).json({ message: "Train number must be 4 to 6 digits." });
  }

  const [trains] = await getDb().execute(
    "SELECT train_number, train_name FROM trains WHERE train_number = ?",
    [trainNumber]
  );
  const train = trains[0];

  if (!train) {
    return res.status(404).json({ message: "Train not found for this train number." });
  }

  return res.json({ train });
}));

module.exports = router;
