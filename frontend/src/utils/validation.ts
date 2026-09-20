import type { FieldErrors, ReservationPayload } from "../types";

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const TRAIN_NUMBER_PATTERN = /^\d{4,6}$/;
const STATION_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;

export function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateReservationForm(payload: ReservationPayload): FieldErrors {
  const errors: FieldErrors = {};
  const passengerName = payload.passengerName.trim();
  const trainNumber = payload.trainNumber.trim();
  const classType = payload.classType.trim();
  const journeyDate = payload.journeyDate.trim();
  const sourceStation = payload.sourceStation.trim();
  const destinationStation = payload.destinationStation.trim();

  if (!passengerName) errors.passengerName = "Passenger name is required.";
  else if (!NAME_PATTERN.test(passengerName)) {
    errors.passengerName =
      "Passenger name may contain letters, spaces, hyphens, apostrophes, and periods only.";
  }

  if (!trainNumber) errors.trainNumber = "Train number is required.";
  else if (!TRAIN_NUMBER_PATTERN.test(trainNumber)) {
    errors.trainNumber = "Train number must be 4 to 6 digits.";
  }

  if (!classType) errors.classType = "Class type is required.";

  if (!journeyDate) errors.journeyDate = "Date of journey is required.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(journeyDate)) {
    errors.journeyDate = "Enter a valid journey date.";
  } else if (journeyDate < todayIsoDate()) {
    errors.journeyDate = "Date of journey cannot be in the past.";
  }

  if (!sourceStation) errors.sourceStation = "Source station is required.";
  else if (!STATION_PATTERN.test(sourceStation)) {
    errors.sourceStation = "Enter a valid source station name.";
  }

  if (!destinationStation) errors.destinationStation = "Destination station is required.";
  else if (!STATION_PATTERN.test(destinationStation)) {
    errors.destinationStation = "Enter a valid destination station name.";
  }

  if (
    sourceStation &&
    destinationStation &&
    sourceStation.toLowerCase() === destinationStation.toLowerCase()
  ) {
    errors.destinationStation = "Source and destination cannot be the same.";
  }

  return errors;
}

export function isNumericTrainNumber(value: string) {
  return TRAIN_NUMBER_PATTERN.test(value.trim());
}
