import { Button } from "../components/Button";

export default function NotFound() {
  return (
    <div className="animate-in fade-in zoom-in flex flex-col items-center justify-center py-20 text-center duration-300">
      <span className="text-primary/20 text-6xl font-black">404</span>
      <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
      <p className="text-text-muted mt-2 mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <a href="/">
        <Button variant="secondary">Go back home</Button>
      </a>
    </div>
  );
}
