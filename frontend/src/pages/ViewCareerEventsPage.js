// frontend/src/pages/ViewCareerEventsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";


const ViewCareerEventsPage = () => {
  const navigate = useNavigate();


  const storedProfile = localStorage.getItem("profile");
  const userProfile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = userProfile?.imageUrl || null;


  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };


  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/event-registrations/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error("Error loading career events:", err);
      alert(
        err.response?.data?.message || "Failed to load career events"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEvents();
  }, []);


  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Top bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white relative shadow-lg">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>


        <div className="flex items-center gap-4 relative">
          <div className="flex items-center bg-white rounded-full px-3 py-1">
            <span className="text-gray-500 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>


          <button
            className="text-2xl font-bold relative hover:scale-110 transition-transform"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </button>


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
        {/* Sidebar (user) */}
        <aside className="w-52 bg-slate-900 text-white pt-6 sticky top-0 self-start h-screen">
          <div className="flex flex-col items-center mb-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User"
                className="w-14 h-14 rounded bg-slate-700 mb-2 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded bg-slate-700 mb-2" />
            )}
            <span className="text-xs text-gray-300">
              {userProfile?.name || "User"}
            </span>
          </div>


          <nav className="flex flex-col text-sm">
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/user-dashboard")}
            >
              Home
            </button>
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/applied-jobs")}
            >
              Applied Jobs
            </button>
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/followed-jobs")}
            >
              Followed Jobs
            </button>
            
            <button className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/query-forum")}
            >
              Query Forum
            </button>
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/user-profile")}
            >
              Profile
            </button>
            <button className="text-left px-4 py-2 bg-indigo-600">
              View CareerEvents
            </button>
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/registered-events")}
            >
              Registered Events
            </button>
          </nav>
        </aside>


        {/* Main content */}
        <main className="flex-1 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 py-10 px-4 md:px-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Elegant Header */}
            <div className="relative bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500 text-white rounded-3xl shadow-2xl p-10 mb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>


              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <h2 className="text-5xl font-black tracking-tight">
                    Career Events
                  </h2>
                </div>
                <p className="text-cyan-50 text-lg font-medium max-w-2xl">
                  Discover amazing career opportunities, workshops, and events from top companies
                </p>
                <div className="mt-6 inline-block bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-100 mb-1">
                    Available Events
                  </p>
                  <p className="text-3xl font-black">{events.length}</p>
                </div>
              </div>
            </div>


            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-teal-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-cyan-300 opacity-20"></div>
                </div>
                <p className="text-slate-700 text-xl font-bold mt-6">
                  Loading events...
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="relative bg-white rounded-3xl shadow-2xl p-20 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl"></div>
                </div>


                <div className="relative z-10">
                  <div className="text-8xl mb-8 animate-bounce">📅</div>
                  <h3 className="text-4xl font-black text-slate-800 mb-5">
                    No Events Available
                  </h3>
                  <p className="text-slate-600 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                    Check back soon! Companies will post new career events and workshops here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {events.map((event, index) => (
                  <div
                    key={event._id}
                    className="bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden group hover:-translate-y-2"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Cover image */}
                    {event.coverImageUrl && (
                      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-100 to-teal-100">
                        <img
                          src={event.coverImageUrl}
                          alt={event.eventName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>


                        {/* Event type badge */}
                        <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-2xl border border-white/50">
                          <span className="text-teal-600 font-black text-sm uppercase tracking-wider">
                            {event.eventType}
                          </span>
                        </div>


                        {/* Date badge */}
                        <div className="absolute bottom-5 left-5 bg-gradient-to-r from-blue-600 to-teal-500 text-white px-5 py-2 rounded-xl shadow-lg">
                          <p className="text-xs font-bold uppercase tracking-wide">
                            {formatDate(event.eventDate)}
                          </p>
                        </div>
                      </div>
                    )}


                    {/* Content */}
                    <div className="p-8">
                      {/* Title & Subtitle */}
                      <div className="mb-6 relative">
                        <div className="absolute -left-4 top-2 w-1 h-16 bg-gradient-to-b from-blue-600 to-teal-500 rounded-full"></div>
                        <h3 className="text-3xl font-black text-slate-900 mb-3 line-clamp-2 leading-tight">
                          {event.eventName}
                        </h3>
                        <p className="text-slate-600 text-base line-clamp-2 leading-relaxed">
                          {event.eventSubtitle}
                        </p>
                      </div>


                      {/* Company Badge */}
                      <div className="mb-6 inline-block">
                        <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-2 border-violet-200 px-5 py-3 rounded-2xl shadow-sm">
                          <span className="text-violet-700 font-bold text-sm flex items-center gap-2">
                            <span className="text-lg">🏢</span>
                            {event.companyName}
                          </span>
                        </div>
                      </div>


                      {/* Date & Location */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100 shadow-sm">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2 tracking-wider">
                            📅 Event Date
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {formatDate(event.eventDate)}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-2xl border-2 border-pink-100 shadow-sm">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2 tracking-wider">
                            ⏰ Deadline
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {formatDate(event.eventDeadline)}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-100 shadow-sm">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2 tracking-wider">
                            📍 Location
                          </p>
                          <p className="text-sm font-black text-slate-900 line-clamp-1">
                            {event.eventPlace}
                          </p>
                        </div>
                      </div>


                      {/* Event Details */}
                      <div className="mb-6 bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase font-black mb-3 flex items-center gap-2 tracking-wider">
                          <span className="text-base">📝</span>
                          Event Details
                        </p>
                        <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                          {event.eventDetails}
                        </p>
                      </div>


                      {/* Website Link */}
                      <div className="mb-6">
                        <a
                          href={event.eventWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-3 text-teal-600 hover:text-teal-700 font-bold text-sm transition-all"
                        >
                          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                            <span>🔗</span>
                          </div>
                          <span className="underline decoration-2 underline-offset-4">
                            Visit Event Website
                          </span>
                          <span className="group-hover:translate-x-2 transition-transform duration-300">
                            →
                          </span>
                        </a>
                      </div>


                      {/* Activity Schedule */}
                      {event.activityList && event.activityList.length > 0 && (
                        <div className="mb-8 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 rounded-2xl border-2 border-orange-200 shadow-sm">
                          <p className="text-xs text-orange-700 uppercase font-black mb-4 flex items-center gap-2 tracking-wider">
                            <span className="text-base">📋</span>
                            Activity Schedule
                          </p>
                          <div className="space-y-3">
                            {event.activityList.slice(0, 3).map((activity, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-sm"
                              >
                                <span className="text-sm font-bold text-slate-800">
                                  {activity.name}
                                </span>
                                <span className="text-xs font-black text-orange-600 bg-orange-100 px-4 py-2 rounded-xl">
                                  {activity.time}
                                </span>
                              </div>
                            ))}
                            {event.activityList.length > 3 && (
                              <p className="text-xs text-slate-500 text-center pt-2 font-bold">
                                +{event.activityList.length - 3} more activities
                              </p>
                            )}
                          </div>
                        </div>
                      )}


                      {/* Register Button */}
                      <button
                        onClick={() => navigate(`/register-event/${event._id}`)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          ✅
                        </span>
                        Register for Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>


      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};


export default ViewCareerEventsPage;
