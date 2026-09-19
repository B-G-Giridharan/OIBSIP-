import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Field, TextInput } from "../components/FormField";
import { BookingCard } from "../components/BookingCard";
import { Modal } from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { api, ApiError } from "../services/api";
import type { Reservation } from "../types";

export function CancelReservationPage() {
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  const [pnr, setPnr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function lookupPnr(value: string) {
    if (!value) {
      setError("PNR number is required.");
      setReservation(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.getReservation(value);
      setReservation(data.reservation);
    } catch (err) {
      setReservation(null);
      setError(err instanceof ApiError ? err.message : "No booking found for this PNR.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fromQuery = searchParams.get("pnr")?.trim().toUpperCase();
    if (fromQuery) {
      setPnr(fromQuery);
      void lookupPnr(fromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function fetchBooking(event: FormEvent) {
    event.preventDefault();
    await lookupPnr(pnr.trim().toUpperCase());
  }

  async function confirmCancel() {
    if (!reservation) return;
    setCancelling(true);
    try {
      const data = await api.cancelReservation(reservation.pnr);
      setReservation(data.reservation);
      setConfirmOpen(false);
      notify("Reservation cancelled successfully.", "success");
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Unable to cancel this reservation.", "error");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-white">Cancel Train Reservation</h2>
        <p className="text-sm text-slate-300">Look up a booking by PNR, review the details, then confirm cancellation.</p>
      </div>

      <form onSubmit={fetchBooking} className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <Field label="PNR Number" error={error} hint="Example: RR58294173">
          <TextInput value={pnr} onChange={(event) => setPnr(event.target.value.toUpperCase())} />
        </Field>
        <Button type="submit" className="mt-4" loading={loading}>
          Fetch Booking
        </Button>
      </form>

      {reservation ? (
        <div className="space-y-4">
          <BookingCard reservation={reservation} />
          {reservation.bookingStatus === "CONFIRMED" ? (
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Confirm Cancellation
            </Button>
          ) : (
            <p className="text-sm text-rose-200">Reservation cancelled successfully.</p>
          )}
        </div>
      ) : null}

      {confirmOpen ? (
        <Modal title="Confirm cancellation" onClose={() => setConfirmOpen(false)}>
          <p className="text-sm text-slate-200">Are you sure you want to cancel this reservation?</p>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={cancelling} onClick={confirmCancel}>
              Yes, Cancel Booking
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
