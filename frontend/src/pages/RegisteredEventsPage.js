// frontend/src/pages/RegisteredEventsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";



const RegisteredEventsPage = () => {
  const navigate = useNavigate();



  const storedProfile = localStorage.getItem("profile");
  const userProfile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = userProfile?.imageUrl || null;



  const [menuOpen, setMenuOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };



  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/event-registrations/my-registrations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Filter only confirmed registrations AND events that still exist (not deleted)
      const confirmed = (res.data || []).filter(
        (reg) => reg.status === "confirmed" && reg.isEmailVerified && reg.eventId
      );
      setRegistrations(confirmed);
    } catch (err) {
      console.error("Error loading registrations:", err);
      alert(
        err.response?.data?.message || "Failed to load registered events"
      );
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchRegistrations();
  }, []);



  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };



  const handleCancelRegistration = async (registrationId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this registration?"
      )
    ) {
      return;
    }



    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/event-registrations/${registrationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Registration cancelled successfully");
      fetchRegistrations(); // Refresh list
    } catch (err) {
      console.error("Error cancelling registration:", err);
      alert(
        err.response?.data?.message || "Failed to cancel registration"
      );
    }
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
        {/* Sidebar */}
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
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/view-career-events")}
            >
              View CareerEvents
            </button>
            <button className="text-left px-4 py-2 bg-indigo-600">
              Registered Events
            </button>
          </nav>
        </aside>



        {/* Main content */}
        <main className="flex-1 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 py-10 px-4 md:px-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 text-white rounded-3xl shadow-2xl p-10 mb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>



              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
                    ✅
                  </div>
                  <h2 className="text-5xl font-black tracking-tight">
                    My Registered Events
                  </h2>
                </div>
                <p className="text-purple-50 text-lg font-medium max-w-2xl">
                  Events you've successfully registered for with confirmed email verification
                </p>
                <div className="mt-6 inline-block bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-100 mb-1">
                    Confirmed Registrations
                  </p>
                  <p className="text-3xl font-black">{registrations.length}</p>
                </div>
              </div>
            </div>



            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-indigo-300 opacity-20"></div>
                </div>
                <p className="text-slate-700 text-xl font-bold mt-6">
                  Loading your registrations...
                </p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="relative bg-white rounded-3xl shadow-2xl p-20 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
                </div>



                <div className="relative z-10">
                  <div className="text-8xl mb-8 animate-bounce">📝</div>
                  <h3 className="text-4xl font-black text-slate-800 mb-5">
                    No Registered Events Yet
                  </h3>
                  <p className="text-slate-600 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                    You haven't registered for any events yet. Browse available events and register to see them here!
                  </p>
                  <button
                    onClick={() => navigate("/view-career-events")}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Browse Events
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {registrations.map((registration, index) => {
                  const event = registration.eventId;
                  if (!event) return null;



                  return (
                    <div
                      key={registration._id}
                      className="bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden group hover:-translate-y-2"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      {/* Confirmation Badge */}
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold text-sm">
                          <span className="text-xl">✅</span>
                          CONFIRMED REGISTRATION
                        </span>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                          {formatDate(registration.verifiedAt || registration.createdAt)}
                        </span>
                      </div>



                      {/* Cover image */}
                      {event.coverImageUrl && (
                        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                          <img
                            src={event.coverImageUrl}
                            alt={event.eventName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>



                          {/* Event type badge */}
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
                            <span className="text-purple-600 font-black text-xs uppercase">
                              {event.eventType}
                            </span>
                          </div>
                        </div>
                      )}



                      {/* Content */}
                      <div className="p-6">
                        {/* Title */}
                        <h3 className="text-2xl font-black text-slate-900 mb-2 line-clamp-2">
                          {event.eventName}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {event.eventSubtitle}
                        </p>



                        {/* Company */}
                        <div className="mb-4 inline-block bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 px-4 py-2 rounded-xl">
                          <span className="text-violet-700 font-bold text-sm flex items-center gap-2">
                            <span>🏢</span>
                            {event.company?.companyName || "Company"}
                          </span>
                        </div>



                        {/* Event Details */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-slate-500 font-bold mb-1">
                              📅 Event Date
                            </p>
                            <p className="text-sm font-black text-slate-900">
                              {formatDate(event.eventDate)}
                            </p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                            <p className="text-xs text-slate-500 font-bold mb-1">
                              📍 Location
                            </p>
                            <p className="text-sm font-black text-slate-900 line-clamp-1">
                              {event.eventPlace}
                            </p>
                          </div>
                        </div>



                        {/* Registration Info */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 mb-4">
                          <p className="text-xs text-purple-700 font-bold uppercase mb-2">
                            📋 Your Registration Details
                          </p>
                          <div className="space-y-1 text-sm">
                            <p className="text-slate-700">
                              <strong>Name:</strong> {registration.fullName}
                            </p>
                            <p className="text-slate-700">
                              <strong>Email:</strong> {registration.email}
                            </p>
                            <p className="text-slate-700">
                              <strong>Mobile:</strong> {registration.mobileNumber}
                            </p>
                            <p className="text-slate-700">
                              <strong>Institution:</strong> {registration.institution}
                            </p>
                          </div>
                        </div>



                        {/* Actions */}
                        <div className="flex gap-3">
                          {event.eventWebsite && (
                            <a
                              href={event.eventWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold text-sm text-center transition"
                            >
                              Visit Website
                            </a>
                          )}
                          <button
                            onClick={() => handleCancelRegistration(registration._id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition"
                          >
                            Cancel Registration
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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



export default RegisteredEventsPage;
