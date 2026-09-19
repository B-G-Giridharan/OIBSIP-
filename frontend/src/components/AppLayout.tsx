import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarClock, LayoutDashboard, LogOut, Ticket, TicketX } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reservations/new", label: "New Reservation", icon: Ticket },
  { to: "/bookings", label: "My Bookings", icon: CalendarClock },
  { to: "/cancel", label: "Cancel Reservation", icon: TicketX },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-[#091627]/90 backdrop-blur-xl lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Logo compact />
          <p className="hidden text-xs text-slate-400 lg:mt-2 lg:block">Signed in as {user?.username}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-amberglow"
                      : "text-sky-100/80 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="hidden px-3 pb-5 lg:block">
          <Button variant="secondary" className="w-full" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amberglow/90">RailReserve</p>
            <h1 className="font-display text-lg font-bold text-white">Passenger operations console</h1>
          </div>
          <Button variant="ghost" className="lg:hidden" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </Button>
        </header>
        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
