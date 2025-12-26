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
  const [statusFilter, setStatusFilter] = useState("all");

  const [emailModal, setEmailModal] = useState({
    open: false,
    to: "",
    name: "",
    subject: "",
    message: "",
    multiple: false,
    recipients: [],
  });

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

  const filteredApplications = applications.filter((a) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending")
      return !a.status || a.status === "pending";
    return a.status === statusFilter;
  });

  // single‑applicant email
  const openEmailModal = (app) => {
    const to = app.userId?.email || "";
    const name = app.userId?.name || "applicant";
    setEmailModal({
      open: true,
      to,
      name,
      subject: `Regarding your application for ${app.jobTitle}`,
      message: `Dear ${name},\n\n`,
      multiple: false,
      recipients: [],
    });
  };

  // bulk email by status
  const openBulkEmailModal = (status) => {
    const recipients = applications
      .filter((a) => a.status === status)
      .map((a) => a.userId?.email)
      .filter(Boolean);

    if (recipients.length === 0) {
      alert(`No ${status} applicants to email.`);
      return;
    }

    const label =
      status === "shortlisted"
        ? "shortlisted"
        : status === "hired"
        ? "hired"
        : "rejected";

    setEmailModal({
      open: true,
      to: `${recipients.length} ${label} applicant(s)`,
      name: `${label} applicants`,
      subject: `Update about your application for ${jobTitle}`,
      message: `Dear applicant,\n\n`,
      multiple: true,
      recipients,
    });
  };

  const closeEmailModal = () =>
    setEmailModal({
      open: false,
      to: "",
      name: "",
      subject: "",
      message: "",
      multiple: false,
      recipients: [],
    });

  const sendEmail = async () => {
    try {
      const token = localStorage.getItem("token");

      if (emailModal.multiple) {
        await Promise.all(
          emailModal.recipients.map((to) =>
            axios.post(
              "http://localhost:5000/api/applications/email",
              {
                to,
                subject: emailModal.subject,
                message: emailModal.message,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/applications/email",
          {
            to: emailModal.to,
            subject: emailModal.subject,
            message: emailModal.message,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Email sent");
      closeEmailModal();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to send email"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* document viewer */}
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

      {/* email modal */}
      {emailModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">
              Email to {emailModal.name}
            </h3>
            <p className="text-xs mb-1">To: {emailModal.to}</p>
            <input
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm mb-2"
              placeholder="Subject"
              value={emailModal.subject}
              onChange={(e) =>
                setEmailModal((m) => ({ ...m, subject: e.target.value }))
              }
            />
            <textarea
              className="w-full h-40 border border-slate-300 rounded p-2 text-sm"
              value={emailModal.message}
              onChange={(e) =>
                setEmailModal((m) => ({ ...m, message: e.target.value }))
              }
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-slate-400 text-white text-xs"
                onClick={closeEmailModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-indigo-600 text-white text-xs"
                onClick={sendEmail}
              >
                Send
              </button>
            </div>
          </div>
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

            {/* status bar */}
            <div className="mb-4">
              <div className="w-full bg-slate-800 text-white rounded-lg shadow flex flex-col md:flex-row">
                <div
                  className={`flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-700 flex items-center justify-between md:justify-center gap-2 cursor-pointer ${
                    statusFilter === "all" ? "bg-slate-500" : ""
                  }`}
                  onClick={() => setStatusFilter("all")}
                >
                  <span className="text-sm md:text-base font-medium">
                    All
                  </span>
                  <span className="text-lg md:text-2xl font-bold">
                    {applications.length}
                  </span>
                </div>

                <div
                  className={`flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-700 flex items-center justify-between md:justify-center gap-2 cursor-pointer ${
                    statusFilter === "pending" ? "bg-slate-600/60" : ""
                  }`}
                  onClick={() => setStatusFilter("pending")}
                >
                  <span className="text-sm md:text-base font-medium">
                    Pending
                  </span>
                  <span className="text-lg md:text-2xl font-bold">
                    {pendingCount}
                  </span>
                </div>

                <div
                  className={`flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-700 flex items-center justify-between md:justify-center gap-2 cursor-pointer ${
                    statusFilter === "shortlisted"
                      ? "bg-blue-700"
                      : "bg-blue-700/40"
                  }`}
                  onClick={() => setStatusFilter("shortlisted")}
                >
                  <span className="text-sm md:text-base font-medium">
                    Shortlisted
                  </span>
                  <span className="text-lg md:text-2xl font-bold text-blue-300">
                    {shortlistedCount}
                  </span>
                </div>

                <div
                  className={`flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-700 flex items-center justify-between md:justify-center gap-2 cursor-pointer ${
                    statusFilter === "hired"
                      ? "bg-green-700"
                      : "bg-green-700/40"
                  }`}
                  onClick={() => setStatusFilter("hired")}
                >
                  <span className="text-sm md:text-base font-medium">
                    Hired
                  </span>
                  <span className="text-lg md:text-2xl font-bold text-green-300">
                    {hiredCount}
                  </span>
                </div>

                <div
                  className={`flex-1 px-4 py-3 flex items-center justify-between md:justify-center gap-2 cursor-pointer ${
                    statusFilter === "rejected"
                      ? "bg-red-700"
                      : "bg-red-700/40"
                  }`}
                  onClick={() => setStatusFilter("rejected")}
                >
                  <span className="text-sm md:text-base font-medium">
                    Rejected
                  </span>
                  <span className="text-lg md:text-2xl font-bold text-red-200">
                    {rejectedCount}
                  </span>
                </div>
              </div>
            </div>

            {/* single bulk button for current tab */}
            {statusFilter === "shortlisted" && shortlistedCount > 0 && (
              <div className="mb-6">
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                  onClick={() => openBulkEmailModal("shortlisted")}
                >
                  Email all shortlisted
                </button>
              </div>
            )}
            {statusFilter === "hired" && hiredCount > 0 && (
              <div className="mb-6">
                <button
                  className="px-3 py-1 rounded bg-green-600 text-white text-xs"
                  onClick={() => openBulkEmailModal("hired")}
                >
                  Email all hired
                </button>
              </div>
            )}
            {statusFilter === "rejected" && rejectedCount > 0 && (
              <div className="mb-6">
                <button
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                  onClick={() => openBulkEmailModal("rejected")}
                >
                  Email all rejected
                </button>
              </div>
            )}

            {loading ? (
              <p>Loading applicants...</p>
            ) : filteredApplications.length === 0 ? (
              <p>No applicants for this filter.</p>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
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

                          {app.careerSummary && app.careerSummary.length > 0 && (
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

                      <div className="flex flex-col items-stretch justify-start gap-2 w-28">
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
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs w-full"
                          onClick={() => openEmailModal(app)}
                        >
                          Send Email
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





















