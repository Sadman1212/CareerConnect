// src/pages/CompanyCandidatesPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
// 🔔 SOCKET.IO
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", { transports: ["websocket"] });


const CompanyCandidatesPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);


  const navigate = useNavigate();


  const storedProfile = localStorage.getItem("profile");
  const profile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = profile?.imageUrl || null;


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };


  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/applications/company",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load candidates"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCandidates();
  }, []);

  // 🔔 SOCKET: Listen for job/applicant deletions and refresh
  useEffect(() => {
    socket.on("job_deleted", async () => {
      console.log("Job deleted event received, refreshing candidates...");
      await fetchCandidates();
    });

    socket.on("application_deleted", async () => {
      console.log("Application deleted event received, refreshing candidates...");
      await fetchCandidates();
    });

    socket.on("notification", async () => {
      console.log("Notification event received, refreshing candidates...");
      await fetchCandidates();
    });

    return () => {
      socket.off("job_deleted");
      socket.off("application_deleted");
      socket.off("notification");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Filter out applications whose jobs have been deleted
  const validApplications = applications.filter((app) => {
    // Only show applications where the job still exists
    return app.jobId && (app.jobId._id || app.jobId);
  });

  const groupedByJob = validApplications.reduce((acc, app) => {
    const key = app.jobId?._id || app.jobId || app.jobTitle;
    if (!acc[key]) {
      acc[key] = {
        jobTitle: app.jobTitle,
        applications: [],
        anyApp: app,
      };
    }
    acc[key].applications.push(app);
    return acc;
  }, {});


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <TopBar />

      <div className="flex flex-1">
        {/* left sidebar */}
        <aside className="w-56 bg-slate-900 text-white pt-6 hidden md:flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center">
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


          <nav className="w-full space-y-1 px-3 text-sm">
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate("/company-dashboard")}
            >
              Dashboard
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate("/company/posted-jobs")}
            >
              Posted Jobs
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded bg-indigo-600"
              onClick={() => navigate("/company/candidates")}
            >
              Candidate list
            </button>
           
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate("/company-query-forum")}
            >
              Query Forum
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate(`/company/${profile?.id || profile?._id}`)}
            >
              Profile
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate("/company/posted-career-events")}
            >
              Posted CareerEvents
            </button>
          </nav>
        </aside>


        {/* main content */}
        <main className="flex-1 bg-gradient-to-b from-slate-200 to-slate-400 py-8 flex justify-center">
          <div className="w-full max-w-5xl mx-4">
            {/* green bar with title above white card */}
            <div className="bg-green-500 text-white px-4 py-2 rounded-t-xl shadow-md mb-0">
              <h2 className="text-lg font-semibold">Jobs and Applicants</h2>
            </div>


            <div className="bg-white rounded-b-xl shadow-2xl p-6 md:p-8">
              {loading ? (
                <p>Loading candidates...</p>
              ) : Object.keys(groupedByJob).length === 0 ? (
                <p>No applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.values(groupedByJob).map((group, index) => {
                    const anyApp = group.anyApp;
                    const jobId = anyApp?.jobId?._id || anyApp?.jobId;


                    const colorClasses = [
                      "from-indigo-50 to-indigo-100 border-indigo-200",
                      "from-pink-50 to-pink-100 border-pink-200",
                      "from-emerald-50 to-emerald-100 border-emerald-200",
                      "from-sky-50 to-sky-100 border-sky-200",
                    ];
                    const chosen =
                      colorClasses[index % colorClasses.length];


                    return (
                      <button
                        key={jobId || group.jobTitle}
                        type="button"
                        onClick={() =>
                          navigate(`/company/jobs/${jobId}/applicants`, {
                            state: { jobTitle: group.jobTitle },
                          })
                        }
                        className={`w-full text-left rounded-lg p-4 bg-gradient-to-r ${chosen} hover:brightness-105 shadow-sm flex justify-between items-center transition transform hover:-translate-y-0.5`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-10 rounded-full bg-indigo-500" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                              Job Title
                            </p>
                            <p className="text-lg font-semibold text-slate-900">
                              {group.jobTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                            Applicants
                          </p>
                          <p className="text-2xl font-bold text-indigo-700">
                            {group.applications.length}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


export default CompanyCandidatesPage;
