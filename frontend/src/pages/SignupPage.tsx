import { useLocation } from "preact-iso";
import { isAuthLoading, isAuthenticated, signup } from "../store/auth";

export default function SignupPage() {
  const { route } = useLocation();

  // TODO: Implement loading State
  if (isAuthLoading.value) return <div>Loading ...</div>;

  if (isAuthenticated.value) {
    route("/");
    return null;
  }

  const signupHandler = (e: Event) => {
    e.preventDefault();
    // Fetch data from form and perform API call
    signup();
  };

  return (
    <div>
      <h1>Signup</h1>
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
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}
