"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mountain-600 to-earth-600 rounded-lg mb-4">
            <span className="text-white font-bold text-2xl">HT</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Login</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back to Himalayan Threads
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field w-full pl-10"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link href="#" className="text-sm text-mountain-600 dark:text-mountain-400 hover:text-mountain-700">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-mountain-600 hover:bg-mountain-700 text-white"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Demo Credentials */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Email: demo@example.com</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">Password: password123</p>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-mountain-600 dark:text-mountain-400 hover:text-mountain-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Continue Shopping Link */}
        <div className="text-center mt-4">
          <Link
            href="/"
            className="inline-block text-mountain-600 dark:text-mountain-400 hover:text-mountain-700 text-sm font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
             