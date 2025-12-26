import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const AppliedJobsPage = () => {
  const navigate = useNavigate();

  const storedProfile = localStorage.getItem("profile");
  const profile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = profile?.imageUrl || null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // One fullscreen modal for both images and PDFs
  // { type: "image" | "pdf", url: string } or null
  const [fullDoc, setFullDoc] = useState(null);

  const [selectedApplication, setSelectedApplication] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    applicationId: null,
    jobTitle: "",
    loading: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/applications/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDeleteApplication = async () => {
    if (!deleteModal.applicationId) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_BASE_URL}/applications/${deleteModal.applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications((prev) =>
        prev.filter((app) => app._id !== deleteModal.applicationId)
      );

      setDeleteModal({
        isOpen: false,
        applicationId: null,
        jobTitle: "",
        loading: false,
      });

      alert("Application deleted successfully!");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert(error.response?.data?.error || "Failed to delete application");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openDeleteModal = (applicationId, jobTitle) => {
    setDeleteModal({
      isOpen: true,
      applicationId,
      jobTitle,
      loading: false,
    });
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL.replace("/api", "")}/${path}`;
  };

  const isPdfFile = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".pdf");
  };

  const getStatusClasses = (status) => {
    if (status === "shortlisted") return "bg-blue-600 text-white";
    if (status === "hired") return "bg-green-600 text-white";
    if (status === "rejected") return "bg-red-600 text-white";
    return "bg-slate-200 text-slate-800";
  };

  const toggleDetails = (id) => {
    setSelectedApplication((prev) => (prev === id ? null : id));
  };

  // open fullscreen modal for image or pdf
  const openFullDoc = (type, path) => {
    const url = getImageUrl(path);
    if (!url) return;
    setFullDoc({ type, url });
  };

  const closeFullDoc = () => setFullDoc(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Fullscreen modal for image or PDF */}
      {fullDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeFullDoc}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeFullDoc}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md font-bold text-lg z-10 shadow-lg"
            >
              ✕ Close
            </button>

            {fullDoc.type === "image" ? (
              <img
                src={fullDoc.url}
                alt="Document"
                className="max-w-[95vw] max-h-[95vh] object-contain bg-white"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <iframe
                src={fullDoc.url}
                title="PDF document"
                className="w-[90vw] h-[90vh] bg-white"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              Delete Application
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete your application for{" "}
              <strong>{deleteModal.jobTitle}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteApplication}
                disabled={deleteModal.loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-semibold disabled:opacity-50"
              >
                {deleteModal.loading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    applicationId: null,
                    jobTitle: "",
                    loading: false,
                  })
                }
                disabled={deleteModal.loading}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white relative">
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
              className="text-left px-4 py-2 bg-indigo-600"
              onClick={() => navigate("/applied-jobs")}
            >
              Applied Jobs
            </button>
            <button className="text-left px-4 py-2 hover:bg-slate-800">
              Followed Jobs
            </button>
            <button className="text-left px-4 py-2 hover:bg-slate-800">
              Messages
            </button>
            <button className="text-left px-4 py-2 hover:bg-slate-800">
              Query Forum
            </button>
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/user-profile")}
            >
              Profile
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gradient-to-b from-gray-100 to-gray-300 py-8 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            {applications.length > 0 && (
              <div className="bg-blue-100 border border-blue-400 text-blue-800 px-6 py-4 rounded-lg mb-6 text-center">
                <h2 className="text-xl font-bold">
                  You have successfully applied for a job using our website!!
                </h2>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                List of your applied jobs:
              </h2>

              {loading ? (
                <p className="text-gray-600 text-center py-12">
                  Loading your applications...
                </p>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-2xl font-semibold text-gray-600">
                    You Haven&apos;t applied for any jobs
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app, index) => (
                    <div
                      key={app._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between">
                        {/* Left side */}
                        <div className="flex items-center flex-1">
                          <span className="text-2xl font-bold text-gray-800 mr-4">
                            {index + 1}.
                          </span>

                          <div className="bg-slate-800 text-white rounded-md shadow-md flex items-center h-16 px-5 mr-4">
                            <div className="w-12 h-12 bg-blue-400 rounded-md flex items-center justify-center overflow-hidden">
                              {app.companyId?.imageUrl ? (
                                <img
                                  src={app.companyId.imageUrl}
                                  alt={app.companyName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-xl">
                                  {app.companyName?.[0]?.toUpperCase() || "C"}
                                </span>
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className="text-lg font-semibold">
                                {app.companyName}
                              </h3>
                            </div>
                          </div>

                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Job Title:</p>
                            <p className="text-base font-semibold text-gray-800">
                              {app.jobTitle}
                            </p>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="text-right ml-4">
                          <p className="text-xs mb-1">
                            <span className="font-semibold text-pink-700">
                              Status:{" "}
                            </span>
                            <span
                              className={`uppercase text-xs px-2 py-1 rounded ${getStatusClasses(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </p>
                          <p className="text-sm font-semibold text-pink-700">
                            Apply Date:{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(app.createdAt).toLocaleTimeString()}
                          </p>
                          <button
                            onClick={() =>
                              openDeleteModal(app._id, app.jobTitle)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm font-semibold transition"
                          >
                            Delete Application
                          </button>
                        </div>
                      </div>

                      {/* View details */}
                      <div className="mt-4 border-t pt-4">
                        <button
                          onClick={() => toggleDetails(app._id)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                        >
                          {selectedApplication === app._id
                            ? "Hide Details ▲"
                            : "View Uploaded Documents ▼"}
                        </button>

                        {selectedApplication === app._id && (
                          <div className="mt-4 space-y-4">
                            {/* CV */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">
                                Curriculum Vitae (CV):
                              </h4>
                              {isPdfFile(app.cvImage) ? (
                                <button
                                  onClick={() =>
                                    openFullDoc("pdf", app.cvImage)
                                  }
                                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition shadow-md"
                                >
                                  <span className="text-2xl">📄</span>
                                  <span className="font-semibold">
                                    View PDF CV
                                  </span>
                                </button>
                              ) : (
                                <div>
                                  <img
                                    src={getImageUrl(app.cvImage)}
                                    alt="CV"
                                    className="w-48 h-48 object-contain border rounded cursor-pointer hover:opacity-80 transition shadow-md"
                                    onClick={() =>
                                      openFullDoc("image", app.cvImage)
                                    }
                                  />
                                  <p className="text-xs text-blue-600 mt-1 font-semibold">
                                    👆 Click to view full size
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Recommendation Letters */}
                            {app.recommendationLetters &&
                              app.recommendationLetters.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2">
                                    Recommendation Letters (
                                    {app.recommendationLetters.length}):
                                  </h4>
                                  <div className="flex flex-wrap gap-4">
                                    {app.recommendationLetters.map(
                                      (letter, idx) => (
                                        <div key={idx}>
                                          {isPdfFile(letter) ? (
                                            <button
                                              onClick={() =>
                                                openFullDoc("pdf", letter)
                                              }
                                              className="inline-flex flex-col items-center gap-2 bg-blue-100 hover:bg-blue-200 px-4 py-3 rounded-md border-2 border-blue-300 transition shadow-md"
                                            >
                                              <span className="text-3xl">
                                                📄
                                              </span>
                                              <span className="text-xs text-blue-700 font-semibold">
                                                PDF {idx + 1}
                                              </span>
                                            </button>
                                          ) : (
                                            <img
                                              src={getImageUrl(letter)}
                                              alt={`Recommendation ${idx + 1}`}
                                              className="w-32 h-32 object-contain border rounded cursor-pointer hover:opacity-80 transition shadow-md"
                                              onClick={() =>
                                                openFullDoc("image", letter)
                                              }
                                            />
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Career Summary */}
                            {app.careerSummary &&
                              app.careerSummary.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2">
                                    Career Summary (
                                    {app.careerSummary.length}):
                                  </h4>
                                  <div className="flex flex-wrap gap-4">
                                    {app.careerSummary.map(
                                      (summary, idx) => (
                                        <div key={idx}>
                                          {isPdfFile(summary) ? (
                                            <button
                                              onClick={() =>
                                                openFullDoc("pdf", summary)
                                              }
                                              className="inline-flex flex-col items-center gap-2 bg-green-100 hover:bg-green-200 px-4 py-3 rounded-md border-2 border-green-300 transition shadow-md"
                                            >
                                              <span className="text-3xl">
                                                📄
                                              </span>
                                              <span className="text-xs text-green-700 font-semibold">
                                                PDF {idx + 1}
                                              </span>
                                            </button>
                                          ) : (
                                            <img
                                              src={getImageUrl(summary)}
                                              alt={`Career Summary ${idx + 1}`}
                                              className="w-32 h-32 object-contain border rounded cursor-pointer hover:opacity-80 transition shadow-md"
                                              onClick={() =>
                                                openFullDoc("image", summary)
                                              }
                                            />
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
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

export default AppliedJobsPage;



