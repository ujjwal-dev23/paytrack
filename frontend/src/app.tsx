import { lazy, LocationProvider, ErrorBoundary, Router, Route } from "preact-iso";

// Synchronous
import Home from "./pages/Home";
import { useEffect } from "preact/hooks";
import { initAuth } from "./store/auth";

// Asynchronous (lazy loaded)
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

export function App() {
  // Initialize auth on app load
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <LocationProvider>
      {/*<div className={"h-screen w-full bg-gray-700"}>*/}
      <ErrorBoundary>
        <Router>
          {/* Synchronous route */}
          <Route path="/" component={Home} />

          {/* Asynchronous routes */}
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />

          {/* Fallback route */}
          <Route default component={NotFound} />
        </Router>
      </ErrorBoundary>
      {/*</div>*/}
    </LocationProvider>
  );
}
