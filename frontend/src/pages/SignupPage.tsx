import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import { isAuthLoading, isAuthenticated, signup } from "../store/auth";

export default function SignupPage() {
  const { route } = useLocation();
  const [error, setError] = useState<string | null>(null);

  if (isAuthLoading.value) return <div>Loading ...</div>;

  if (isAuthenticated.value) {
    route("/");
    return null;
  }

  const signupHandler = async (e: Event) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signup({ username, email, password });
      route("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={signupHandler}>
        <div>
          <label>Username: </label>
          <input type="text" name="username" required />
        </div>
        <div>
          <label>Email: </label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" name="password" required />
        </div>
        <button type="submit" disabled={isAuthLoading.value}>
          {isAuthLoading.value ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}
