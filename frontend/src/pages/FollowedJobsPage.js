// frontend/src/pages/FollowedJobsPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const FollowedJobsPage = () => {
  const navigate = useNavigate();


  const storedProfile = localStorage.getItem("profile");
  const profile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = profile?.imageUrl || null;


  const [menuOpen, setMenuOpen] = useState(false);
  const [followedJobs, setFollowedJobs] = useState([]);
  const [loading, setLoading] = useState(true);


  const [sortOption, setSortOption] = useState("newest");
  const [lastUpdated, setLastUpdated] = useState(null);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };


  const fetchFollowedJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setFollowedJobs([]);
        setLastUpdated(new Date());
        return;
      }


      const res = await axios.get(
        "http://localhost:5000/api/jobs/user/followed",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setFollowedJobs(res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Error loading followed jobs:",
        err.response?.data || err.message
      );
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load followed jobs"
      );
    } finally {
      setLoading(false);
    }
  };


  const handleUnfollow = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to manage followed jobs");
        return;
      }


      await axios.delete(`http://localhost:5000/api/jobs/${jobId}/follow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      setFollowedJobs((prev) => prev.filter((job) => job._id !== jobId));
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Error unfollowing job:",
        err.response?.data || err.message
      );
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to unfollow job"
      );
    }
  };


  useEffect(() => {
    fetchFollowedJobs();
  }, []);


  const sortedJobs = useMemo(() => {
    const copy = [...followedJobs];


    if (sortOption === "newest") {
      const newestFirst = (a, b) => {
        const aDate = a.createdAt || a.deadline || 0;
        const bDate = b.createdAt || b.deadline || 0;
        return new Date(bDate) - new Date(aDate);
      };
      copy.sort(newestFirst);
    } else if (sortOption === "oldest") {
      const oldestFirst = (a, b) => {
        const aDate = a.createdAt || a.deadline || 0;
        const bDate = b.createdAt || b.deadline || 0;
        return new Date(aDate) - new Date(bDate);
      };
      copy.sort(oldestFirst);
    } else if (sortOption === "company") {
      copy.sort((a, b) => {
        const aName =
          a.company?.companyName || a.company?.name || "zzzzzz";
        const bName =
          b.company?.companyName || b.company?.name || "zzzzzz";
        return aName.localeCompare(bName);
      });
    }


    return copy;
  }, [followedJobs, sortOption]);


  const totalFollowed = followedJobs.length;


  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    return `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Top bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white relative shadow-md">
        <h1 className="text-2xl font-semibold tracking-wide">CareerConnect</h1>


        <div className="flex items-center gap-4 relative">
          <div className="hidden md:flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
            <span className="text-gray-500 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>


          <button
            className="text-2xl font-bold relative"
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
        {/* Left sidebar */}
        <aside className="w-52 bg-slate-900 text-white pt-6 sticky top-0 self-start h-screen">
          <div className="flex flex-col items-center mb-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-14 h-14 rounded bg-slate-700 mb-2 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded bg-slate-700 mb-2" />
            )}
            <span className="text-xs text-gray-300">
              {profile?.name || "User"}
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
            <button className="text-left px-4 py-2 bg-indigo-600">
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
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/registered-events")}
            >
              Registered Events
            </button>
          </nav>
        </aside>


        {/* Main content */}
        <main className="flex-1 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 py-10 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header + tracker */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Here are the jobs that you are following
                </h2>
                <p className="text-sm text-slate-600 max-w-xl">
                  Track and manage all the opportunities you care about in one
                  place. Apply quickly or unfollow whenever you change your
                  mind.
                </p>


                {lastUpdated && (
                  <div className="inline-flex items-center gap-4 px-5 py-3 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg border border-indigo-400">
                    <div className="w-10 h-10 rounded-2xl bg-white/90 flex items-center justify-center text-xl">
                      ⏱️
                    </div>
                    <div className="leading-tight text-white">
                      <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                        Last updated
                      </div>
                      <div className="text-lg md:text-2xl font-extrabold">
                        {formatLastUpdated()}
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {/* Tracker card */}
              <div className="relative">
                <div className="rounded-3xl shadow-2xl px-7 py-5 text-slate-900 min-w-[230px] bg-gradient-to-br from-white via-sky-50 to-indigo-50 border border-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-600">
                        Followed jobs
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-xs font-bold text-indigo-600 shadow">
                      {totalFollowed > 9 ? "9+" : totalFollowed}
                    </div>
                  </div>
                  <p className="text-5xl font-black leading-none mb-2 text-slate-900">
                    {totalFollowed}
                  </p>
                  <p className="text-xs text-slate-600">
                    {totalFollowed === 0
                      ? "Start following roles to build your shortlist."
                      : "You can apply, track, or remove any of these saved jobs."}
                  </p>
                </div>
                <div className="absolute -right-3 -bottom-3 w-10 h-10 rounded-2xl bg-indigo-600 shadow-md flex items-center justify-center text-white text-xl border border-indigo-100">
                  💼
                </div>
              </div>
            </div>


            {/* Sort bar */}
            {totalFollowed > 0 && (
              <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="font-bold uppercase tracking-[0.2em] text-slate-500">
                    Sort by
                  </span>
                </div>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => setSortOption("newest")}
                    className={`px-4 py-2 rounded-full border font-semibold transition text-sm shadow-sm ${
                      sortOption === "newest"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortOption("oldest")}
                    className={`px-4 py-2 rounded-full border font-semibold transition text-sm shadow-sm ${
                      sortOption === "oldest"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => setSortOption("company")}
                    className={`px-4 py-2 rounded-full border font-semibold transition text-sm shadow-sm ${
                      sortOption === "company"
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Company A–Z
                  </button>
                </div>
              </div>
            )}


            {/* Followed jobs grid / empty state */}
            {loading ? (
              <p className="text-sm text-gray-600">Loading followed jobs...</p>
            ) : sortedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center border border-dashed border-slate-300">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Your followed list is empty.
                </p>
                <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
                  Discover jobs on the Home page and tap{" "}
                  <span className="font-semibold text-indigo-600">
                    Follow
                  </span>{" "}
                  to save interesting roles here for later.
                </p>
                <button
                  onClick={() => navigate("/user-dashboard")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-2.5 rounded-full text-sm font-semibold shadow-md"
                >
                  Explore Jobs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedJobs.map((job) => {
                  const companyName =
                    job.company?.companyName ||
                    job.company?.name ||
                    "Company";
                  const companyLogo = job.company?.imageUrl || null;
                  const logoFallback =
                    companyName && typeof companyName === "string"
                      ? companyName[0].toUpperCase()
                      : "C";


                  return (
                    <div
                      key={job._id}
                      className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 mr-3 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                              {companyLogo ? (
                                <img
                                  src={companyLogo}
                                  alt={companyName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                logoFallback
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {companyName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {job.department} • {job.category}
                              </p>
                            </div>
                          </div>


                          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold shadow-sm">
                            Following
                          </span>
                        </div>


                        <p className="text-sm font-semibold text-slate-900 mb-1">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          Student: {job.studentCategory} • Gender: {job.gender}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          Deadline:{" "}
                          {job.deadline
                            ? new Date(job.deadline).toLocaleDateString()
                            : "N/A"}
                        </p>


                        <div className="mt-2 text-xs text-gray-700 line-clamp-3">
                          {job.description}
                        </div>
                      </div>


                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() =>
                            navigate(`/apply-job/${job._id}`, {
                              state: {
                                companyName,
                                companyId: job.company?._id,
                                jobTitle: job.title,
                              },
                            })
                          }
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                        >
                          Apply Now
                        </button>


                        <button
                          onClick={() => handleUnfollow(job._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                        >
                          Cancel Following
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};


export default FollowedJobsPage;
