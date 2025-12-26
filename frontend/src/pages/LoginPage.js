import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useGoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "user" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      let url = "";

      if (form.role === "admin") {
        url = `${API_BASE_URL}/admin/login`;
      } else {
        url = `${API_BASE_URL}/auth/login`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role === "admin" ? undefined : form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      if (form.role === "admin" && data.admin) {
        console.log("saved admin profile", data.admin);
        localStorage.setItem("profile", JSON.stringify(data.admin));
      } else if (data.profile) {
        console.log("saved user/company profile", data.profile);
        localStorage.setItem("profile", JSON.stringify(data.profile));
      }

      setLoading(false);

      if (form.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.profile?.role === "company") {
        navigate("/company-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const userInfo = await userInfoRes.json();

        const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userInfo.email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Google login failed");
          return;
        }

        localStorage.setItem("token", data.token);

        if (data.profile) {
          console.log("saved google profile", data.profile);
          localStorage.setItem("profile", JSON.stringify(data.profile));
        }

        if (data.profile?.role === "company") {
          navigate("/company-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } catch (err) {
        console.error(err);
        setMessage("Google login failed");
      }
    },
    onError: (err) => {
      console.error(err);
      setMessage(
        "Google login failed, register first if you don't have an account"
      );
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      <header className="w-full bg-blue-900 text-white flex items-center px-10 py-4 shadow-md">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-8 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute right-6 top-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4 py-1 rounded-full shadow"
          >
            Back
          </button>

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Log In into your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login as
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="company">Company</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-xs text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <p className="text-sm text-red-600 mt-1">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">Or</span>
            <button
              type="button"
              onClick={() => googleLogin()}
              className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md shadow-sm text-sm font-medium w-full"
            >
              <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                G
              </span>
              <span>Login with Google</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

