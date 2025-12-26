import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// 🔔 SOCKET.IO
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", { transports: ["websocket"] });

const CompanyDashboardPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedProfile = localStorage.getItem("profile");
  const profile = storedProfile ? JSON.parse(storedProfile) : null;

  const [menuOpen, setMenuOpen] = useState(false);
  // 🔔 NOTIFICATION STATE
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const avatarUrl = profile?.imageUrl || null;

  // 🔔 NOTIFICATION FUNCTIONS
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications/unread-count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // 🔔 FETCH NOTIFICATIONS ON MOUNT
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // 🔔 SOCKET NOTIFICATIONS
  useEffect(() => {
    socket.on("notification", async (data) => {
      // Fetch fresh notifications and unread count
      await fetchNotifications();
      await fetchUnreadCount();
      // Show browser alert
      alert(`🔔 ${data.title}\n${data.message}`);
    });

    return () => socket.off("notification");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/"); // redirect to homepage
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Top bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white relative">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>

        <div className="flex items-center gap-4 relative">
          <div className="flex items-center bg-white rounded-full px-3 py-1">
            <span className="text-gray-500 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => window.open('/company-search', '_blank')}
              className="bg-transparent outline-none text-sm text-gray-700 cursor-text"
            />
          </div>

          {/* 🔔 NOTIFICATION BUTTON */}
          <div className="relative">
            <button
              className="text-2xl font-bold relative hover:opacity-80"
              onClick={() => setNotificationOpen((prev) => !prev)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popup */}
            {notificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white text-gray-800 rounded-md shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-indigo-500 text-white px-4 py-3 flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <span
                    className="cursor-pointer text-lg"
                    onClick={() => setNotificationOpen(false)}
                  >
                    ✕
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                          !notif.isRead ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => markAsRead(notif._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📅 GOOGLE CALENDAR BUTTON */}
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl hover:opacity-80 transition"
            title="Open Google Calendar"
          >
            📅
          </a>

          {/* menu button */}
          <button
            className="text-2xl font-bold relative"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </button>

          {/* dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-md shadow-lg py-2 w-40 z-10">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/change-password");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Change password
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
        {/* Left sidebar */}
        <aside className="w-56 bg-slate-900 text-white pt-6">
          <div className="flex flex-col items-center mb-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Company"
                className="w-16 h-16 rounded-md bg-slate-700 mb-2 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-slate-700 mb-2" />
            )}
            <span className="text-xs text-gray-300">
              {profile?.companyName || profile?.name || "Company"}
            </span>
          </div>

          <nav className="flex flex-col text-sm">
            {/* stay on dashboard */}
            <button
              className="text-left px-4 py-2 bg-indigo-600"
              onClick={() => navigate("/company-dashboard")}
            >
              Dashboard
            </button>

            {/* go to posted jobs page */}
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company/posted-jobs")}
            >
              Posted Jobs
            </button>

            {/* go to candidate list page */}
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company/candidates")}
            >
              Candidate list
            </button>

            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company/messages")}
            >
              Messages
            </button>

            <button className="text-left px-4 py-2 hover:bg-slate-800">
              Query Forum
            </button>

            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate(`/company/${profile?.id || profile?._id}`)}
            >
              Profile
            </button>
          </nav>
        </aside>

        {/* Main area (dashboard content) */}
        <main className="flex-1 bg-gradient-to-b from-gray-100 to-gray-300 flex">
          <div className="w-full mt-6 px-6">
            <div className="bg-white shadow-lg rounded-md p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Welcome to Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  Start Your Journey by sharing your first post!
                </p>
              </div>

              {/* navigate to Add Job page */}
              <button
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow"
                onClick={() => navigate("/company/jobs/new")}
              >
                Add Job post
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;




