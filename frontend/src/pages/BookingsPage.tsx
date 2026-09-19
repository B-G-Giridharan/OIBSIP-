import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Field, TextInput } from "../components/FormField";
import { api, ApiError } from "../services/api";
import type { Reservation } from "../types";

export function BookingsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    pnr: "",
    passenger: "",
    trainNumber: "",
    journeyDate: "",
  });
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(next = filters) {
    setLoading(true);
    setError("");
    try {
      const data = await api.listReservations(next);
      setRows(data.reservations);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-white">My Bookings</h2>
        <p className="text-sm text-slate-300">Search by PNR, passenger name, train number, or journey date.</p>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          void load(filters);
        }}
      >
        <Field label="PNR">
          <TextInput value={filters.pnr} onChange={(event) => setFilters({ ...filters, pnr: event.target.value })} />
        </Field>
        <Field label="Passenger name">
          <TextInput
            value={filters.passenger}
            onChange={(event) => setFilters({ ...filters, passenger: event.target.value })}
          />
        </Field>
        <Field label="Train number">
          <TextInput
            value={filters.trainNumber}
            onChange={(event) => setFilters({ ...filters, trainNumber: event.target.value })}
          />
        </Field>
        <Field label="Journey date">
          <TextInput
            type="date"
            value={filters.journeyDate}
            onChange={(event) => setFilters({ ...filters, journeyDate: event.target.value })}
          />
        </Field>
        <div className="flex items-end">
          <Button type="submit" className="w-full" loading={loading}>
            Search
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading bookings…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
          No bookings match the current filters.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-white/10 md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  {[
                    "PNR",
                    "Passenger",
                    "Train Number",
                    "Train Name",
                    "Class",
                    "Journey Date",
                    "Source",
                    "Destination",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.pnr} className="border-t border-white/10 text-sky-100">
                    <td className="px-3 py-3 font-semibold">{row.pnr}</td>
                    <td className="px-3 py-3">{row.passengerName}</td>
                    <td className="px-3 py-3">{row.trainNumber}</td>
                    <td className="px-3 py-3">{row.trainName}</td>
                    <td className="px-3 py-3">{row.classType}</td>
                    <td className="px-3 py-3">{row.journeyDate}</td>
                    <td className="px-3 py-3">{row.sourceStation}</td>
                    <td className="px-3 py-3">{row.destinationStation}</td>
                    <td className="px-3 py-3">{row.bookingStatus}</td>
                    <td className="px-3 py-3">
                      <Button variant="ghost" onClick={() => navigate(`/cancel?pnr=${row.pnr}`)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <article key={row.pnr} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-display text-xl font-bold text-white">{row.pnr}</p>
                <p className="text-sm text-slate-300">{row.passengerName}</p>
                <p className="mt-2 text-sm text-sky-100">
                  {row.trainNumber} · {row.trainName}
                </p>
                <p className="text-sm text-slate-300">
                  {row.sourceStation} → {row.destinationStation}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-amberglow">{row.bookingStatus}</p>
                <Button className="mt-3 w-full" variant="secondary" onClick={() => navigate(`/cancel?pnr=${row.pnr}`)}>
                  Manage
                </Button>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
