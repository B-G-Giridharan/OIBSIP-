import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Field, SelectInput, TextInput } from "../components/FormField";
import { BookingCard } from "../components/BookingCard";
import { Modal } from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { api, ApiError } from "../services/api";
import { CLASS_TYPES, type FieldErrors, type Reservation, type ReservationPayload, type Train } from "../types";
import { isNumericTrainNumber, todayIsoDate, validateReservationForm } from "../utils/validation";

const emptyForm: ReservationPayload = {
  passengerName: "",
  trainNumber: "",
  classType: "",
  journeyDate: "",
  sourceStation: "",
  destinationStation: "",
};

export function NewReservationPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [trainName, setTrainName] = useState("");
  const [trains, setTrains] = useState<Train[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);

  useEffect(() => {
    api.listTrains().then((data) => setTrains(data.trains)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const trainNumber = form.trainNumber.trim();
    if (!trainNumber) {
      setTrainName("");
      return;
    }
    if (!isNumericTrainNumber(trainNumber)) {
      setTrainName("");
      setErrors((current) => ({ ...current, trainNumber: "Train number must be 4 to 6 digits." }));
      return;
    }

    const handle = window.setTimeout(async () => {
      setLookingUp(true);
      try {
        const data = await api.getTrain(trainNumber);
        setTrainName(data.train.train_name);
        setErrors((current) => {
          const next = { ...current };
          delete next.trainNumber;
          return next;
        });
      } catch (error) {
        setTrainName("");
        setErrors((current) => ({
          ...current,
          trainNumber:
            error instanceof ApiError ? error.message : "Train not found for this train number.",
        }));
      } finally {
        setLookingUp(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [form.trainNumber]);

  function update<K extends keyof ReservationPayload>(key: K, value: ReservationPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateReservationForm(form);
    if (!trainName) {
      nextErrors.trainNumber = nextErrors.trainNumber || "Train not found for this train number.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await api.createReservation(form);
      setConfirmation(result.reservation);
      notify("Ticket booked successfully.", "success");
      setForm(emptyForm);
      setTrainName("");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        notify(error.message, "error");
      } else {
        notify("Unable to book the ticket right now.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function printConfirmation() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-white">Book Train Ticket</h2>
        <p className="text-sm text-slate-300">Enter passenger and journey details. Train name fills in from the train number.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5" noValidate>
        <h3 className="font-semibold text-amberglow">Passenger Information</h3>
        <Field label="Passenger Name" error={errors.passengerName}>
          <TextInput
            value={form.passengerName}
            onChange={(event) => update("passengerName", event.target.value)}
            autoComplete="name"
          />
        </Field>

        <h3 className="font-semibold text-amberglow">Train Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Train Number" error={errors.trainNumber} hint="Select or type a 4–6 digit train number">
            <TextInput
              list="train-numbers"
              inputMode="numeric"
              value={form.trainNumber}
              onChange={(event) => update("trainNumber", event.target.value.replace(/\D/g, ""))}
            />
            <datalist id="train-numbers">
              {trains.map((train) => (
                <option key={train.train_number} value={train.train_number}>
                  {train.train_name}
                </option>
              ))}
            </datalist>
          </Field>
          <Field label="Train Name" hint={lookingUp ? "Looking up train…" : "Filled automatically"}>
            <TextInput value={trainName} readOnly placeholder="Appears after a valid train number" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class Type" error={errors.classType}>
            <SelectInput value={form.classType} onChange={(event) => update("classType", event.target.value)}>
              <option value="">Select class</option>
              {CLASS_TYPES.map((item) => (
                <option key={item} value={item} className="text-black">
                  {item}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Date of Journey" error={errors.journeyDate}>
            <TextInput
              type="date"
              min={todayIsoDate()}
              value={form.journeyDate}
              onChange={(event) => update("journeyDate", event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Source Station" error={errors.sourceStation}>
            <TextInput value={form.sourceStation} onChange={(event) => update("sourceStation", event.target.value)} />
          </Field>
          <Field label="Destination Station" error={errors.destinationStation}>
            <TextInput
              value={form.destinationStation}
              onChange={(event) => update("destinationStation", event.target.value)}
            />
          </Field>
        </div>

        <Button type="submit" className="w-full py-3 text-base" loading={submitting}>
          Book Ticket
        </Button>
      </form>

      {confirmation ? (
        <Modal title="BOOKING CONFIRMED" onClose={() => setConfirmation(null)}>
          <div className="print-area space-y-4">
            <BookingCard reservation={confirmation} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setConfirmation(null)}>Close</Button>
              <Button variant="secondary" onClick={printConfirmation}>
                Print / Download
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmation(null);
                  navigate("/reservations/new");
                }}
              >
                Book Another Ticket
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
