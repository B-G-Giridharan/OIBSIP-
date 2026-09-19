import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Ticket, TicketPlus, TicketX } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../services/api";
import type { DashboardSummary } from "../types";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Unable to load dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-sky-500/10 to-amber-400/10 p-6">
        <p className="text-sm text-sky-200">Welcome back</p>
        <h2 className="font-display text-3xl font-extrabold text-white">Hello, {user?.username}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-300">
          Manage reservations, look up train details, and keep passenger bookings on track from one console.
        </p>
      </section>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total bookings", value: data?.totals.total ?? 0, icon: CalendarClock },
          { label: "Confirmed", value: data?.totals.confirmed ?? 0, icon: Ticket },
          { label: "Cancelled", value: data?.totals.cancelled ?? 0, icon: TicketX },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">{card.label}</p>
                <Icon size={18} className="text-amberglow" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-white">{loading ? "—" : card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Button onClick={() => navigate("/reservations/new")}>
          <TicketPlus size={16} /> New Reservation
        </Button>
        <Button variant="secondary" onClick={() => navigate("/cancel")}>
          <TicketX size={16} /> Cancel Reservation
        </Button>
        <Button variant="secondary" onClick={() => navigate("/bookings")}>
          <CalendarClock size={16} /> View Bookings
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-display text-lg font-bold text-white">Recent bookings</h3>
        {loading ? (
          <p className="mt-3 text-sm text-slate-400">Loading recent activity…</p>
        ) : data?.recent.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2 pr-4">PNR</th>
                  <th className="py-2 pr-4">Passenger</th>
                  <th className="py-2 pr-4">Train</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((item) => (
                  <tr key={item.pnr} className="border-t border-white/10 text-sky-100">
                    <td className="py-2 pr-4 font-semibold">{item.pnr}</td>
                    <td className="py-2 pr-4">{item.passengerName}</td>
                    <td className="py-2 pr-4">
                      {item.trainNumber} · {item.trainName}
                    </td>
                    <td className="py-2 pr-4">{item.journeyDate}</td>
                    <td className="py-2">{item.bookingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No bookings yet. Start with a new reservation.</p>
        )}
      </section>
    </div>
  );
}
