export type User = {
  id: number;
  username: string;
};

export type Train = {
  train_number: string;
  train_name: string;
};

export type Reservation = {
  pnr: string;
  passengerName: string;
  trainNumber: string;
  trainName: string;
  classType: string;
  journeyDate: string;
  sourceStation: string;
  destinationStation: string;
  bookingStatus: "CONFIRMED" | "CANCELLED" | string;
  createdAt: string;
};

export type ReservationPayload = {
  passengerName: string;
  trainNumber: string;
  classType: string;
  journeyDate: string;
  sourceStation: string;
  destinationStation: string;
};

export type FieldErrors = Record<string, string>;

export type DashboardSummary = {
  totals: {
    total: number;
    confirmed: number;
    cancelled: number;
  };
  recent: Reservation[];
};

export const CLASS_TYPES = [
  "First AC",
  "Second AC",
  "Third AC",
  "Sleeper",
  "General",
] as const;
