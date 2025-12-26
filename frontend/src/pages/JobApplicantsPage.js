import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docView, setDocView] = useState({ url: null, isPdf: false });

  const jobTitle = location.state?.jobTitle || "Job Applicants";

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/applications/company?jobId=${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load applicants"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000/${path}`;
  };

  const openDoc = (path) => {
    const url = getFileUrl(path);
    if (!url) return;
    const isPdf = url.toLowerCase().endsWith(".pdf");
    setDocView({ url, isPdf });
  };
  const closeDoc = () => setDocView({ url: null, isPdf: false });

  const getStatusClasses = (status) => {
    if (status === "shortlisted") return "bg-blue-600 text-white";
    if (status === "hired") return "bg-green-600 text-white";
    if (status === "rejected") return "bg-red-600 text-white";
    return "bg-slate-200 text-slate-800";
  };

  const formatAppliedDate = (isoString) => {
    if (!isoString) return { bdDate: "", bdTime: "" };
    const date = new Date(isoString);
    const bdDate = date.toLocaleDateString("en-GB", {
      timeZone: "Asia/Dhaka",
    });
    const bdTime = date.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { bdDate, bdTime };
  };

  const updateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/applications/company/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) => prev.filter((a) => a._id !== applicationId));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete application"
      );
    }
  };

  const pendingCount = applications.filter(
    (a) => !a.status || a.status === "pending"
  ).length;
  const shortlistedCount = applications.filter(
    (a) => a.status === "shortlisted"
  ).length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;
  const rejectedCount = applications.filter(
    (a) => a.status === "rejected"
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {docView.url && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeDoc}
        >
          <button
            type="button"
            onClick={closeDoc}
            className="absolute top-4 right-4 text-white text-2xl font-bold px-3 py-1 bg-red-600 rounded-full hover:bg-red-700"
          >
            ×
          </button>
          {docView.isPdf ? (
            <iframe
              src={docView.url}
              title="Document"
              className="w-[95vw] h-[95vh] bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={docView.url}
              alt="Document"
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      <header className="w-full flex items-center justify-between px-6 py-3 bg-slate-900">
        <button
          onClick={() => navigate("/company/candidates")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
        >
          ← Back to jobs
        </button>
        <h1 className="text-xl font-semibold">CareerConnect</h1>
        <div />
      </header>

      <main className="flex-1 bg-gradient-to-b from-slate-200 to-slate-400 py-6 px-4 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-slate-900">
            <h2 className="text-lg font-semibold mb-4">
              Applicants for: {jobTitle}
            </h2>

            {/* BIG STATUS BAR */}
            <div className="mb-6">
              <div className="w-full bg-slate-800 text-white rounded-lg shadow flex flex-col md:flex-row">
                <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-700 flex items-center justify-between md:justify-center gap-2">
                  <span className="text-sm md:text-base font-medium">
                    Pending
                  </span>
                  <span className="text-lg md:text-2xl font-bold">
                    {pendingCount}
                  </span>
                </div>
                <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-700 flex items-center justify-between md:justify-center gap-2 bg-blue-700/40">
                  <span className="text-sm md:text-base font-medium">
                    Shortlisted
                  </span>
                  <span className="text-lg md:text-2xl font-bold text-blue-300">
                    {shortlistedCount}
                  </span>
                </div>
                <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-700 flex items-center justify-between md:justify-center gap-2 bg-green-700/40">
                  <span className="text-sm md:text-base font-medium">
                    Hired
                  </span>
                  <span className="text-lg md:text-2xl font-bold text-green-300">
                    {hiredCount}
                  </span>
                </div>
                <div className="flex-1 px-4 py-3 flex items-center justify-between md:justify-center gap-2 bg-red-700/40">
                  <span className="text-sm md:text-base font-medium">
                    Rejected
                  </span>
                  <span className="text-lg md:text-2xl font-bold text-red-200">
                    {rejectedCount}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <p>Loading applicants...</p>
            ) : applications.length === 0 ? (
              <p>No applicants for this job yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const { bdDate, bdTime } = formatAppliedDate(app.createdAt);
                  return (
                    <div
                      key={app._id}
                      className="border border-slate-200 rounded-lg p-4 flex justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 text-sm text-slate-900">
                        {app.userId?.imageUrl ? (
                          <img
                            src={app.userId.imageUrl}
                            alt="Candidate"
                            className="w-12 h-12 rounded-full object-cover mt-1"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-300 mt-1" />
                        )}

                        <div>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Applicant:
                            </span>{" "}
                            {app.userId?.name || "User"}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Email:
                            </span>{" "}
                            {app.userId?.email || "N/A"}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Mobile number:
                            </span>{" "}
                            {app.userId?.mobile || "N/A"}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Student type:
                            </span>{" "}
                            {app.userId?.studentType || "N/A"}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Department:
                            </span>{" "}
                            {app.userId?.department || "N/A"}
                          </p>
                          <p>
                            <span className="font-semibold text-pink-700">
                              Job Title:
                            </span>{" "}
                            {app.jobTitle}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold text-pink-700">
                              Status:
                            </span>{" "}
                            <span
                              className={`uppercase text-xs px-2 py-1 rounded ${getStatusClasses(
                                app.status
                              )}`}
                            >
                              {app.status || "pending"}
                            </span>
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold text-pink-700">
                              Applied on:
                            </span>{" "}
                            {bdDate}{" "}
                            <span className="text-xs text-slate-600">
                              {bdTime}
                            </span>
                          </p>

                          {app.cvImage && (
                            <p className="mt-1">
                              <span className="font-semibold text-pink-700">
                                CV:
                              </span>{" "}
                              <button
                                type="button"
                                onClick={() => openDoc(app.cvImage)}
                                className="text-indigo-600 underline text-xs"
                              >
                                View CV
                              </button>
                            </p>
                          )}

                          {app.recommendationLetters &&
                            app.recommendationLetters.length > 0 && (
                              <p className="mt-1">
                                <span className="font-semibold text-pink-700">
                                  Recommendations:
                                </span>{" "}
                                {app.recommendationLetters.map((file, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => openDoc(file)}
                                    className="text-indigo-600 underline text-xs mr-2"
                                  >
                                    View Recommendation {idx + 1}
                                  </button>
                                ))}
                              </p>
                            )}

                          {app.careerSummary &&
                            app.careerSummary.length > 0 && (
                              <p className="mt-1">
                                <span className="font-semibold text-pink-700">
                                  Career Summary:
                                </span>{" "}
                                {app.careerSummary.map((file, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => openDoc(file)}
                                    className="text-indigo-600 underline text-xs mr-2"
                                  >
                                    View Career Summary {idx + 1}
                                  </button>
                                ))}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col items-stretch justify-start gap-2 w-24">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs w-full"
                          onClick={() => updateStatus(app._id, "shortlisted")}
                        >
                          Shortlist
                        </button>
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs w-full"
                          onClick={() => updateStatus(app._id, "hired")}
                        >
                          Hire
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs w-full"
                          onClick={() => updateStatus(app._id, "rejected")}
                        >
                          Reject
                        </button>
                        <button
                          className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs w-full"
                          onClick={() => deleteApplication(app._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobApplicantsPage;







