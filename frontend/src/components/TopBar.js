import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // notifications
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
    fetchNotifications();
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("notification", async (data) => {
      await fetchNotifications();
      await fetchUnreadCount();
      try {
        alert(`🔔 ${data.title}\n${data.message}`);
      } catch (e) {}
    });
    return () => socket.off("notification");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  const openSearchRoute = () => {
    const isCompany = location.pathname.startsWith("/company");
    const target = isCompany ? "/company-search" : "/search";
    navigate(target);
  };

  return (
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
            onFocus={openSearchRoute}
            className="bg-transparent outline-none text-sm text-gray-700 cursor-text"
          />
        </div>

        <div className="relative">
          <button
            className="text-2xl font-bold relative hover:opacity-80"
            onClick={() => setNotificationOpen((p) => !p)}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white text-gray-800 rounded-md shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-indigo-500 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold">Notifications</h3>
                <span className="cursor-pointer text-lg" onClick={() => setNotificationOpen(false)}>✕</span>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500">No notifications yet</div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div key={notif._id} className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${!notif.isRead ? "bg-indigo-50" : ""}`} onClick={() => markAsRead(notif._id)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1 ml-2" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:opacity-80 transition" title="Open Google Calendar">📅</a>

        <button className="text-2xl font-bold relative" onClick={() => setMenuOpen((p) => !p)}>☰</button>

        {menuOpen && (
          <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-md shadow-lg py-2 w-40 z-10">
            <button onClick={() => { setMenuOpen(false); navigate("/change-password"); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Change password</button>
            <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
