import { user, logout, isAuthenticated } from "../store/auth";

export default function Home() {
  return (
    <>
      <h1>Payment Tracker App</h1>
      <nav>
        <ul>
          {!isAuthenticated.value ? (
            <>
              <li>
                <a href="/login">Login</a>
              </li>
              <li>
                <a href="/signup">Signup</a>
              </li>
            </>
          ) : (
            <>
              <li>Welcome, {user.value?.username}!</li>
              <li>
                <button onClick={() => logout()}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
}
