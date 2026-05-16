import { lazy, LocationProvider, ErrorBoundary, Router, Route } from "preact-iso";
import { useEffect } from "preact/hooks";
import { initAuth } from "./store/auth";
import { Layout } from "./components/Layout";

// Pages
import Home from "./pages/Home";
const InvoicesPage = lazy(() => import("./pages/InvoicesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

export function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <LocationProvider>
      <ErrorBoundary>
        <Layout>
          <Router>
            <Route path="/" component={Home} />
            <Route path="/invoices" component={InvoicesPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route default component={NotFound} />
          </Router>
        </Layout>
      </ErrorBoundary>
    </LocationProvider>
  );
}
