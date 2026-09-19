import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Field, TextInput } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({});

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!username.trim()) nextErrors.username = "Username is required.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Access denied. Invalid username or password.";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-xl">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">Sign in to continue</h1>
        <p className="mt-1 text-sm text-slate-300">Book, review, and cancel train reservations securely.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <Field label="Username" error={errors.username}>
            <TextInput
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <TextInput
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          {errors.form ? <p className="text-sm text-rose-300">{errors.form}</p> : null}
          <Button type="submit" className="w-full" loading={submitting}>
            Login
          </Button>
        </form>
        <p className="mt-5 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">
          Demo account: <span className="text-sky-200">demo</span> / <span className="text-sky-200">Demo@123</span>
        </p>
      </div>
    </div>
  );
}
