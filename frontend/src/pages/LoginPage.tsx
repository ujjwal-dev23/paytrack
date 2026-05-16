import { useLocation } from "preact-iso";
import { isAuthenticated, isAuthLoading, login } from "../store/auth";

export default function LoginPage() {
  const { route } = useLocation();

  // TODO: Implement loading State
  if (isAuthLoading.value) return <div>Loading ...</div>;

  if (isAuthenticated.value) {
    route("/");
    return null;
  }

  const loginHandler = (e: Event) => {
    e.preventDefault();
    // Fetch data from form and perform API call
    login({ id: "2", email: "test2@example.com" }, "fake_token");
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={loginHandler}>
        <div>
          <label>Email: </label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" name="password" required />
        </div>
        <button type="submit">Sign In</button>
      </form>
      <p>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
