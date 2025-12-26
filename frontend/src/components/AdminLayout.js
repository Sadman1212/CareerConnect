// src/components/AdminLayout.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLayout = ({ profile, children }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Top Bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 relative">
        <h1 className="text-2xl font-semibold">CareerConnect Admin</h1>

        <div className="flex items-center gap-4 relative">
          <div className="flex items-center bg-white rounded-full px-3 py-1 text-gray-700">
            🔍
            <input
              type="text"
              placeholder="Search"
              onFocus={() => navigate('/search')}
              className="ml-2 bg-transparent outline-none text-sm text-gray-700 cursor-text"
            />
          </div>

          <button className="text-2xl font-bold" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-md shadow-lg py-2 w-44 z-10">
              <button
                onClick={() => { setMenuOpen(false); navigate("/change-password"); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900 pt-6 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl text-white">
              {profile?.name?.[0] || "A"}
            </div>
            <span className="text-xs text-gray-300 mt-2">{profile?.name || "Admin"}</span>
          </div>

          <nav className="flex flex-col w-full text-sm px-3">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className={`text-left px-4 py-2 rounded-md mb-1 w-full ${
                window.location.pathname === "/admin-dashboard"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/admin-panel")}
              className={`text-left px-4 py-2 rounded-md mb-1 w-full ${
                window.location.pathname === "/admin-panel"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              Admin Panel
            </button>

            <button className="text-left px-4 py-2 hover:bg-slate-800 w-full">User Management</button>
            <button className="text-left px-4 py-2 hover:bg-slate-800 w-full">Reports</button>
            <button className="text-left px-4 py-2 hover:bg-slate-800 w-full">Settings</button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gradient-to-b from-gray-100 to-gray-300 p-6 text-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
