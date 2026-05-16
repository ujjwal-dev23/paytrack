import type { ComponentChildren } from "preact";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ComponentChildren;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
      <footer className="text-text-muted py-8 text-center text-xs">
        &copy; {new Date().getFullYear()} PayTrack. Minimal & Secure.
      </footer>
    </div>
  );
}
