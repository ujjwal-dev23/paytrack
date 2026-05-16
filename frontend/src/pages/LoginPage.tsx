import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import { isAuthenticated, isAuthLoading, login } from "../store/auth";

export default function LoginPage() {
  const { route } = useLocation();
  const [error, setError] = useState<string | null>(null);

  if (isAuthLoading.value) return <div>Loading ...</div>;

  if (isAuthenticated.value) {
    route("/");
    return null;
  }

  const loginHandler = async (e: Event) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login({ email, password });
      route("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={loginHandler}>
        <div>
          <label>Email: </label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" name="password" required />
        </div>
        <button type="submit" disabled={isAuthLoading.value}>
          {isAuthLoading.value ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <p>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
