// frontend/src/pages/PostedCareerEventsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import TopBar from "../components/TopBar";


const PostedCareerEventsPage = () => {
  const navigate = useNavigate();


  const storedProfile = localStorage.getItem("profile");
  const companyProfile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = companyProfile?.imageUrl || null;


  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  // Ensure only company can see this
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !companyProfile || companyProfile.role !== "company") {
      alert("Only company accounts can view posted career events.");
      navigate("/login");
    }
  }, [companyProfile, navigate]);


  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/career-events/company`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error("Error loading company events:", err);
      alert(
        err.response?.data?.message ||
          "Failed to load your posted career events"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEvents();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };


  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/career-events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      alert("Event deleted successfully.");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete event. Please try again."
      );
    }
  };


  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <TopBar />

      <div className="flex flex-1">
        {/* Sidebar (company) - FIXED TO MATCH DASHBOARD */}
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
              {companyProfile?.companyName || companyProfile?.name || "Company"}
            </span>
          </div>


          <nav className="flex flex-col text-sm">
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company-dashboard")}
            >
              Dashboard
            </button>


            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company/posted-jobs")}
            >
              Posted Jobs
            </button>


            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company/candidates")}
            >
              Candidate list
            </button>





            <button className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company-query-forum")}
            >
              Query Forum
            </button>


            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company-profile")}
            >
              Profile
            </button>


            <button className="text-left px-4 py-2 bg-indigo-600">
              Posted CareerEvents
            </button>
          </nav>
        </aside>


        {/* Main content */}
        <main className="flex-1 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 py-10 px-4 md:px-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Elegant Deep Blue to Teal Header */}
            <div className="relative bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500 text-white rounded-3xl shadow-2xl p-10 mb-10 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
                      🎯
                    </div>
                    <h2 className="text-5xl font-black tracking-tight">
                      Your Career Events
                    </h2>
                  </div>
                  <p className="text-cyan-50 text-lg font-medium max-w-2xl">
                    Manage all career events and workshops created by your company
                  </p>
                  <div className="mt-6 flex items-center gap-6">
                    <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30">
                      <p className="text-xs font-bold uppercase tracking-wider text-cyan-100 mb-1">
                        Total Events
                      </p>
                      <p className="text-3xl font-black">{events.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30">
                      <p className="text-xs font-bold uppercase tracking-wider text-cyan-100 mb-1">
                        Active
                      </p>
                      <p className="text-3xl font-black">{events.length}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/company/career-events/new")}
                  className="bg-white text-teal-600 px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-3 group"
                >
                  <span className="text-3xl group-hover:rotate-90 transition-transform duration-300">
                    +
                  </span>
                  Add CareerEvent
                </button>
              </div>
            </div>


            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-teal-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-cyan-300 opacity-20"></div>
                </div>
                <p className="text-slate-700 text-xl font-bold mt-6">
                  Loading your events...
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="relative bg-white rounded-3xl shadow-2xl p-20 text-center overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-8xl mb-8 animate-bounce">📅</div>
                  <h3 className="text-4xl font-black text-slate-800 mb-5">
                    No Events Posted Yet
                  </h3>
                  <p className="text-slate-600 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                    Create a new workshop, career fair, or information session to
                    engage with students and showcase amazing opportunities.
                  </p>
                  <button
                    onClick={() => navigate("/company/career-events/new")}
                    className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
                  >
                    <span className="text-2xl">✨</span>
                    Create Your First Event
                  </button>
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
                    {/* Cover image with sophisticated overlay */}
                    {event.coverImageUrl && (
                      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-100 to-teal-100">
                        <img
                          src={event.coverImageUrl}
                          alt={event.eventName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        
                        {/* Floating badge */}
                        <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-2xl border border-white/50">
                          <span className="text-teal-600 font-black text-sm uppercase tracking-wider">
                            {event.eventType}
                          </span>
                        </div>


                        {/* Gradient badge at bottom */}
                        <div className="absolute bottom-5 left-5 bg-gradient-to-r from-blue-600 to-teal-500 text-white px-5 py-2 rounded-xl shadow-lg">
                          <p className="text-xs font-bold uppercase tracking-wide">
                            {formatDate(event.eventDate)}
                          </p>
                        </div>
                      </div>
                    )}


                    {/* Content with enhanced spacing */}
                    <div className="p-8">
                      {/* Title & Subtitle with decorative line */}
                      <div className="mb-6 relative">
                        <div className="absolute -left-4 top-2 w-1 h-16 bg-gradient-to-b from-blue-600 to-teal-500 rounded-full"></div>
                        <h3 className="text-3xl font-black text-slate-900 mb-3 line-clamp-2 leading-tight">
                          {event.eventName}
                        </h3>
                        <p className="text-slate-600 text-base line-clamp-2 leading-relaxed">
                          {event.eventSubtitle}
                        </p>
                      </div>


                      {/* Premium Company Badge */}
                      <div className="mb-6 inline-block">
                        <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-2 border-violet-200 px-5 py-3 rounded-2xl shadow-sm">
                          <span className="text-violet-700 font-bold text-sm flex items-center gap-2">
                            <span className="text-lg">🏢</span>
                            {event.companyName}
                          </span>
                        </div>
                      </div>


                      {/* Enhanced Date & Location Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2 tracking-wider">
                            📅 Event Date
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {formatDate(event.eventDate)}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-2xl border-2 border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2 tracking-wider">
                            ⏰ Deadline
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {formatDate(event.eventDeadline)}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-100 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-xs text-slate-500 uppercase font-black mb-2 tracking-wider">
                            📍 Location
                          </p>
                          <p className="text-sm font-black text-slate-900 line-clamp-1">
                            {event.eventPlace}
                          </p>
                        </div>
                      </div>


                      {/* Event Details with icon */}
                      <div className="mb-6 bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase font-black mb-3 flex items-center gap-2 tracking-wider">
                          <span className="text-base">📝</span>
                          Event Details
                        </p>
                        <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                          {event.eventDetails}
                        </p>
                      </div>


                      {/* Stylish Website Link */}
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


                      {/* Premium Activity Schedule - Soft Peach/Orange */}
                      {event.activityList && event.activityList.length > 0 && (
                        <div className="mb-8 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 rounded-2xl border-2 border-orange-200 shadow-sm">
                          <p className="text-xs text-orange-700 uppercase font-black mb-4 flex items-center gap-2 tracking-wider">
                            <span className="text-base">📋</span>
                            Activity Schedule
                          </p>
                          <div className="space-y-3">
                            {event.activityList
                              .slice(0, 3)
                              .map((activity, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
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


                      {/* Premium Action Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            navigate(`/company/career-events/${event._id}/edit`)
                          }
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                          <span className="group-hover:rotate-12 transition-transform">
                            ✏️
                          </span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                          <span className="group-hover:scale-110 transition-transform">
                            🗑️
                          </span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>


      {/* Add animation keyframes */}
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


export default PostedCareerEventsPage;
