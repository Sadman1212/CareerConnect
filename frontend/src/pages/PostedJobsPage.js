// src/pages/PostedJobsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PostedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const storedProfile = localStorage.getItem("profile");
  const profile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = profile?.imageUrl || null;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/jobs/company", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs((prev) => prev.filter((job) => job._id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete job"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* top bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white">
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

          {/* hamburger menu with dropdown */}
          <div className="relative">
            <button
              className="text-2xl font-bold"
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white text-gray-800 rounded-md shadow-lg py-2 w-40 z-10">
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
        </div>
      </header>

      {/* main area with sidebar + content */}
      <div className="flex flex-1">
        {/* left sidebar: sticky so it stays while scrolling */}
        <aside className="w-56 bg-slate-900 text-white pt-6 hidden md:flex flex-col items-center sticky top-0 self-start h-screen">
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
              className="w-full text-left px-4 py-2 rounded bg-indigo-600"
              onClick={() => navigate("/company/posted-jobs")}
            >
              Posted Jobs
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate("/company/candidates")}
            >
              Candidate list
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate("/company/messages")}
            >
              Messages
            </button>
            {/* NEW: Query Forum */}
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate("/company/query-forum")}
            >
              Query Forum
            </button>
            <button
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-800"
              onClick={() => navigate(`/company/${profile?.id || profile?._id}`)}
            >
              Profile
            </button>
          </nav>
        </aside>

        {/* content pane */}
        <main className="flex-1 bg-gradient-to-b from-slate-200 to-slate-400 py-10 flex justify-center">
          <div className="w-full max-w-5xl mx-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Posted Jobs
                </h2>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : jobs.length === 0 ? (
                <p>No jobs posted yet.</p>
              ) : (
                <div className="space-y-6">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="border border-slate-200 rounded-lg p-4 md:p-5 flex justify-between items-start gap-4"
                    >
                      <div className="text-sm text-slate-900 leading-relaxed w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <p>
                            <span className="font-semibold text-pink-700">
                              Job Title:
                            </span>{" "}
                            {job.title}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Job Category:
                            </span>{" "}
                            {job.category}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Department:
                            </span>{" "}
                            {job.department}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
                          <p>
                            <span className="font-semibold text-pink-700">
                              Student Category:
                            </span>{" "}
                            {job.studentCategory}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Gender:
                            </span>{" "}
                            {job.gender}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Deadline:
                            </span>{" "}
                            {job.deadline
                              ? new Date(job.deadline).toLocaleDateString()
                              : ""}
                          </p>
                        </div>

                        <p className="mt-1">
                          <span className="font-semibold text-pink-700">
                            Address:
                          </span>{" "}
                          {job.address}
                        </p>

                        <p className="font-semibold text-pink-700 mt-3">
                          Job Description
                        </p>
                        <p className="whitespace-pre-line text-gray-700">
                          {job.description}
                        </p>

                        <p className="font-semibold text-pink-700 mt-3">
                          Job Requirements
                        </p>
                        <p className="whitespace-pre-line text-gray-700">
                          {job.requirements}
                        </p>

                        <p className="font-semibold text-pink-700 mt-3">
                          Job Benefits
                        </p>
                        <p className="whitespace-pre-line text-gray-700">
                          {job.benefits}
                        </p>

                        <p className="font-semibold text-pink-700 mt-3">
                          Job Experience
                        </p>
                        <p className="whitespace-pre-line text-gray-700">
                          {job.experience}
                        </p>

                        <p className="font-semibold text-pink-700 mt-3">
                          Salary Range
                        </p>
                        <p className="text-gray-700">{job.salaryRange}</p>
                      </div>

                      <div className="flex flex-col space-y-2 items-stretch">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white w-24 py-1.5 rounded shadow text-sm text-center"
                          onClick={() =>
                            navigate(`/company/jobs/${job._id}/edit`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white w-24 py-1.5 rounded shadow text-sm text-center"
                          onClick={() => handleDelete(job._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostedJobsPage;








