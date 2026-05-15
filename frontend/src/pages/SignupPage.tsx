export default function SignupPage() {
  return (
    <div>
      <h1>Signup</h1>
      <form>
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
