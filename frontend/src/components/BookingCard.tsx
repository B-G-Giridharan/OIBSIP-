import type { Reservation } from "../types";

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function BookingCard({ reservation }: { reservation: Reservation }) {
  const confirmed = reservation.bookingStatus === "CONFIRMED";

  return (
    <article className="ticket-card rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amberglow">
        Booking {confirmed ? "Confirmed" : "Cancelled"}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-wide text-white">{reservation.pnr}</p>
      <dl className="mt-4 grid gap-2 text-sm text-sky-100/90 sm:grid-cols-2">
        <div>
          <dt className="text-slate-400">Passenger Name</dt>
          <dd className="font-medium">{reservation.passengerName}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Class</dt>
          <dd className="font-medium">{reservation.classType}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Train Number</dt>
          <dd className="font-medium">{reservation.trainNumber}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Train Name</dt>
          <dd className="font-medium">{reservation.trainName}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Journey Date</dt>
          <dd className="font-medium">{formatDate(reservation.journeyDate)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Status</dt>
          <dd className={`font-semibold ${confirmed ? "text-emerald-300" : "text-rose-300"}`}>
            {reservation.bookingStatus}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">From</dt>
          <dd className="font-medium">{reservation.sourceStation}</dd>
        </div>
        <div>
          <dt className="text-slate-400">To</dt>
          <dd className="font-medium">{reservation.destinationStation}</dd>
        </div>
      </dl>
    </article>
  );
}
