import type { DashboardSummary, Reservation, ReservationPayload, Train, User } from "../types";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please check your connection.", 0);
  }

  const data = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    throw new ApiError(
      data.message || "Request could not be completed.",
      response.status,
      data.errors
    );
  }

  return data;
}

export const api = {
  login(username: string, password: string) {
    return request<{ message: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  logout() {
    return request<{ message: string }>("/api/auth/logout", { method: "POST" });
  },
  me() {
    return request<{ user: User }>("/api/auth/me");
  },
  listTrains() {
    return request<{ trains: Train[] }>("/api/trains");
  },
  getTrain(trainNumber: string) {
    return request<{ train: Train }>(`/api/trains/${encodeURIComponent(trainNumber)}`);
  },
  dashboard() {
    return request<DashboardSummary>("/api/reservations/summary");
  },
  createReservation(payload: ReservationPayload) {
    return request<{ message: string; reservation: Reservation }>("/api/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listReservations(filters: {
    pnr?: string;
    passenger?: string;
    trainNumber?: string;
    journeyDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters.pnr) params.set("pnr", filters.pnr);
    if (filters.passenger) params.set("passenger", filters.passenger);
    if (filters.trainNumber) params.set("trainNumber", filters.trainNumber);
    if (filters.journeyDate) params.set("journeyDate", filters.journeyDate);
    const query = params.toString();
    return request<{ reservations: Reservation[] }>(
      `/api/reservations${query ? `?${query}` : ""}`
    );
  },
  getReservation(pnr: string) {
    return request<{ reservation: Reservation }>(
      `/api/reservations/${encodeURIComponent(pnr)}`
    );
  },
  cancelReservation(pnr: string) {
    return request<{ message: string; reservation: Reservation }>(
      `/api/reservations/${encodeURIComponent(pnr)}`,
      { method: "DELETE" }
    );
  },
};
