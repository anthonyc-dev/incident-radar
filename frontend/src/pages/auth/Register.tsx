
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const { register, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    // Validate password confirmation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
      toast.success("Account created successfully! Welcome!");
      // PublicRoute redirects to /home when accessToken is set (same render, no race)
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error ?? err.message
        : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left: Image section */}
      <div className="hidden md:flex flex-col items-center justify-center bg-linear-to-br from-amber-100 via-yellow-200 to-amber-300 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="530" cy="90" r="120" fill="#F59E42" fillOpacity="0.14" />
            <circle cx="70" cy="500" r="90" fill="#D97706" fillOpacity="0.12" />
            <circle cx="220" cy="150" r="60" fill="#FDE68A" fillOpacity="0.18" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-6xl text-center font-extrabold text-amber-700 mb-4 drop-shadow-lg">
            Welcome to Incident Radar
          </h2>
          <p className="text-lg text-amber-900 max-w-md text-center font-medium mb-3 drop-shadow-sm">
            Create a free account and start managing incidents today. <span className="text-amber-600 font-bold">Sign up</span> to access your dashboard!
          </p>
          <span className="inline-block px-4 py-1 bg-amber-300/40 rounded-full text-sm font-semibold shadow-sm text-amber-800 mt-1">
            Your radar, your control. Instantly. 🚨
          </span>
        </div>
      </div>
      {/* Right: Register form */}
      <div className="flex justify-center items-center bg-white px-6 py-12">
        <Card className="w-full max-w-md shadow-lg border border-neutral-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2 text-center text-amber-700">
              Create Account
            </CardTitle>
            <p className="text-sm text-gray-500 text-center">
              Sign up to get started
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
                <Label htmlFor="name" className="text-amber-800">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  required
                  autoComplete="name"
                  className="bg-amber-50/70 border border-amber-200"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError();
                  }}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  autoComplete="email"
                  className="bg-amber-50/70 border border-amber-200"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-800">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  autoComplete="new-password"
                  className="bg-amber-50/70 border border-amber-200"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-amber-800">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="********"
                  required
                  autoComplete="new-password"
                  className="bg-amber-50/70 border border-amber-200"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError();
                  }}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-2 w-full">
            <p className="text-sm text-amber-700 font-medium">
              Already have an account?
            </p>
            <Link
              to="/"
              className="text-sm text-amber-700 hover:underline font-medium"
            >
              Log in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
