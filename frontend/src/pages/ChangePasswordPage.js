// src/pages/ChangePasswordPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config"; // e.g. "http://localhost:5000/api"

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "error" | "success" | ""
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage("All fields are required");
      setStatus("error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New passwords do not match");
      setStatus("error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Password change failed");
        setStatus("error");
        setLoading(false);
        return;
      }

      setMessage("Password updated successfully");
      setStatus("success");
      setLoading(false);

      // optional: go back to previous page after success
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      console.error(err);
      setMessage("Server error");
      setStatus("error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      <header className="w-full bg-slate-900 text-white flex items-center justify-between px-10 py-4 shadow-md">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Change password
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4 py-1 rounded-full shadow"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter previous password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Re-enter new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {message && (
              <p
                className={`text-sm mt-1 ${
                  status === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
