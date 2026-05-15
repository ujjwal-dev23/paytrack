export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <form>
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
