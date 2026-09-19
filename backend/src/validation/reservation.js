const CLASS_TYPES = [
  "First AC",
  "Second AC",
  "Third AC",
  "Sleeper",
  "General",
];

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const TRAIN_NUMBER_PATTERN = /^\d{4,6}$/;
const STATION_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validateReservationPayload(body) {
  const errors = {};
  const passengerName = String(body.passengerName ?? "").trim();
  const trainNumber = String(body.trainNumber ?? "").trim();
  const classType = String(body.classType ?? "").trim();
  const journeyDate = String(body.journeyDate ?? "").trim();
  const sourceStation = String(body.sourceStation ?? "").trim();
  const destinationStation = String(body.destinationStation ?? "").trim();

  if (!passengerName) {
    errors.passengerName = "Passenger name is required.";
  } else if (!NAME_PATTERN.test(passengerName)) {
    errors.passengerName =
      "Passenger name may contain letters, spaces, hyphens, apostrophes, and periods only.";
  }

  if (!trainNumber) {
    errors.trainNumber = "Train number is required.";
  } else if (!TRAIN_NUMBER_PATTERN.test(trainNumber)) {
    errors.trainNumber = "Train number must be 4 to 6 digits.";
  }

  if (!classType) {
    errors.classType = "Class type is required.";
  } else if (!CLASS_TYPES.includes(classType)) {
    errors.classType = "Select a valid class type.";
  }

  if (!journeyDate) {
    errors.journeyDate = "Date of journey is required.";
  } else if (!isValidDateString(journeyDate)) {
    errors.journeyDate = "Enter a valid journey date.";
  } else if (journeyDate < todayIsoDate()) {
    errors.journeyDate = "Date of journey cannot be in the past.";
  }

  if (!sourceStation) {
    errors.sourceStation = "Source station is required.";
  } else if (!STATION_PATTERN.test(sourceStation)) {
    errors.sourceStation = "Enter a valid source station name.";
  }

  if (!destinationStation) {
    errors.destinationStation = "Destination station is required.";
  } else if (!STATION_PATTERN.test(destinationStation)) {
    errors.destinationStation = "Enter a valid destination station name.";
  }

  if (
    sourceStation &&
    destinationStation &&
    sourceStation.toLowerCase() === destinationStation.toLowerCase()
  ) {
    errors.destinationStation = "Source and destination cannot be the same.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    value: {
      passengerName,
      trainNumber,
      classType,
      journeyDate,
      sourceStation,
      destinationStation,
    },
  };
}

function validatePnr(pnr) {
  const value = String(pnr ?? "").trim().toUpperCase();
  if (!/^RR\d{8}$/.test(value)) {
    return { isValid: false, value, error: "Enter a valid PNR (example: RR58294173)." };
  }
  return { isValid: true, value };
}

module.exports = {
  CLASS_TYPES,
  TRAIN_NUMBER_PATTERN,
  validateReservationPayload,
  validatePnr,
};
