import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import { isAuthenticated, login } from "../store/auth";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export default function LoginPage() {
  const { route } = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated.value) {
    route("/");
    return null;
  }

  const loginHandler = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login({ email, password });
      route("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-sm sm:mt-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-text-muted mt-2">Enter your credentials to access your account</p>
      </div>

      <div className="card">
        <form onSubmit={loginHandler} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="name@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="rounded-custom border border-red-100 bg-red-50 p-3">
              <p className="text-center text-xs text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>
      </div>

      <p className="text-text-muted mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-primary font-medium hover:underline">
          Create one
        </a>
      </p>
    </div>
  );
}
