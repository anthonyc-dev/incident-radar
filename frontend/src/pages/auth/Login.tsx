import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      await login(email, password);
      // PublicRoute redirects to /home when accessToken is set (same render, no race)
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error ?? err.message
        : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);

    }
  }


  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: Branding */}
      <div className="relative hidden overflow-hidden md:flex flex-col items-center justify-center bg-linear-to-br from-amber-100 via-yellow-200 to-amber-300">
        <div className="pointer-events-none absolute inset-0">
          <svg
            className="h-full w-full"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="530" cy="90" r="120" fill="#F59E42" fillOpacity="0.14" />
            <circle cx="70" cy="500" r="90" fill="#D97706" fillOpacity="0.12" />
            <circle cx="220" cy="150" r="60" fill="#FDE68A" fillOpacity="0.18" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="mb-4 text-center text-6xl font-extrabold text-amber-700 drop-shadow-lg">
            Welcome to Incident Radar
          </h2>
          <p className="mb-3 max-w-md text-center text-lg font-medium text-amber-900 drop-shadow-sm">
            Monitor, track, and resolve incidents efficiently.{" "}
            <span className="font-bold text-amber-600">Sign in</span> to get a
            real-time overview of your system&apos;s health.
          </p>
          <span className="mt-1 inline-block rounded-full bg-amber-300/40 px-4 py-1 text-sm font-semibold text-amber-800 shadow-sm">
            Stay alert. Instant incident radar at your fingertips 🚨
          </span>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <Card className="w-full max-w-md border border-neutral-200 shadow-lg">
          <CardHeader>
            <CardTitle className="mb-2 text-center text-3xl font-bold text-amber-700">
              Welcome Back
            </CardTitle>
            <p className="text-center text-sm text-gray-500">
              Login to your account
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div
                className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                role="alert"
              >
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-800">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  autoComplete="email"
                  className="border border-amber-200 bg-amber-50/70"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-800">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  autoComplete="current-password"
                  className="border border-amber-200 bg-amber-50/70"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="mt-4 w-full bg-amber-700 font-semibold text-white hover:bg-amber-800"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="mt-2 flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
            <p className="text-sm font-medium text-amber-700">
              Don&apos;t have an account?
            </p>
            <Link
              to="/register"
              className="text-sm font-medium text-amber-700 hover:underline"
            >
              Register
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
