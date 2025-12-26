// src/pages/CompanyQueryForumPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

const API = "http://localhost:5000/api/query-forum";

const CompanyQueryForumPage = () => {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const token = localStorage.getItem("token");

  const [questions, setQuestions] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  // now supports "company"
  const [view, setView] = useState("latest"); // "latest" | "famous" | "company"

  const avatarUrl = profile?.imageUrl || null;
  const authorId = profile?.id;
  const authorName = profile?.name || "Company";
  const authorImageUrl = profile?.imageUrl || "";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(res.data || []);
      } catch (err) {
        console.error("GET /query-forum error", err);
        alert(err.response?.data?.error || "Failed to load queries");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleReply = async (qId) => {
    const text = replyText[qId]?.trim();
    if (!text) return;

    try {
      const res = await axios.post(
        `${API}/${qId}/replies`,
        {
          text,
          authorId,
          authorName,
          authorImageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions((prev) => prev.map((q) => (q._id === qId ? res.data : q)));
      setReplyText((prev) => ({ ...prev, [qId]: "" }));
    } catch (err) {
      console.error("POST /query-forum/:id/replies error", err);
      alert(err.response?.data?.error || "Failed to send reply");
    }
  };

  const handleUpvote = async (qId) => {
    try {
      const res = await axios.post(
        `${API}/${qId}/upvote`,
        { authorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions((prev) => prev.map((q) => (q._id === qId ? res.data : q)));
    } catch (err) {
      console.error("POST /query-forum/:id/upvote error", err);
      alert(err.response?.data?.error || "Failed to upvote");
    }
  };

  const startEditReply = (reply) => {
    setEditingReplyId(reply._id);
    setEditingReplyText(reply.text);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyText("");
  };

  const handleUpdateReply = async (qId, replyId) => {
    if (!editingReplyText.trim()) return;
    try {
      const res = await axios.patch(
        `${API}/${qId}/replies/${replyId}`,
        { text: editingReplyText.trim(), authorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions((prev) => prev.map((q) => (q._id === qId ? res.data : q)));
      setEditingReplyId(null);
      setEditingReplyText("");
    } catch (err) {
      console.error("PATCH /query-forum/:id/replies/:replyId error", err);
      alert(err.response?.data?.error || "Failed to update reply");
    }
  };

  const handleDeleteReply = async (qId, replyId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await axios.delete(`${API}/${qId}/replies/${replyId}`, {
        data: { authorId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions((prev) => prev.map((q) => (q._id === qId ? res.data : q)));
    } catch (err) {
      console.error("DELETE /query-forum/:id/replies/:replyId error", err);
      alert(err.response?.data?.error || "Failed to delete reply");
    }
  };

  // sorting
  const latestQuestions = [...questions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const famousQuestions = [...questions].sort(
    (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
  );

  // company-specific list (title/body contains company name)
  const companyName = (profile?.name || "").toLowerCase();
  const companyQuestions = questions.filter((q) => {
    if (!companyName) return false;
    const text = `${q.title} ${q.body}`.toLowerCase();
    return text.includes(companyName);
  });

  const baseList =
    view === "latest"
      ? latestQuestions
      : view === "famous"
      ? famousQuestions
      : companyQuestions;

  const filteredQuestions = baseList.filter((q) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      q.title.toLowerCase().includes(s) ||
      q.body.toLowerCase().includes(s) ||
      (q.authorName || "").toLowerCase().includes(s)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/company-dashboard"); // company home
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <TopBar />

      <div className="flex flex-1">
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
              {profile?.name || "Company"}
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
            
            <button className="text-left px-4 py-2 bg-indigo-600">
              Query Forum
            </button>
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company-profile")}
            >
              Profile
            </button>
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/company/posted-career-events")}
            >
              Posted CareerEvents
            </button>
          </nav>
        </aside>

        <main className="flex-1 bg-gradient-to-b from-gray-100 to-gray-300 py-8 px-4 md:px-8">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView("latest")}
                  className={`px-3 py-1 text-sm rounded ${
                    view === "latest"
                      ? "bg-[#6c3cf0] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Latest queries
                </button>
                <button
                  type="button"
                  onClick={() => setView("famous")}
                  className={`px-3 py-1 text-sm rounded ${
                    view === "famous"
                      ? "bg-[#6c3cf0] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Famous queries
                </button>
                <button
                  type="button"
                  onClick={() => setView("company")}
                  className={`px-3 py-1 text-sm rounded ${
                    view === "company"
                      ? "bg-[#6c3cf0] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Company queries
                </button>
              </div>

              <div className="flex md:items-center md:justify-between gap-3">
                <h2 className="text-2xl font-semibold text-[#4b2bb3]">
                  Query Forum (All user queries)
                </h2>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search queries..."
                  className="border rounded px-3 py-2 text-sm w-full md:w-64"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-gray-600">Loading queries...</p>
            ) : filteredQuestions.length === 0 ? (
              <p className="text-sm text-gray-600">
                No matching queries. Try a different search.
              </p>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <div
                    key={q._id}
                    className="border rounded-lg p-4 bg-slate-50 space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {q.authorImageUrl && (
                              <img
                                src={q.authorImageUrl}
                                alt={q.authorName || "User"}
                                className="w-7 h-7 rounded-full object-cover"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            )}
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {q.title}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                by {q.authorName || "User"} •{" "}
                                {new Date(q.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-line">
                            {q.body}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => handleUpvote(q._id)}
                          className="text-xs px-2 py-1 rounded border border-[#6c3cf0] text-[#6c3cf0] hover:bg-[#6c3cf0] hover:text-white"
                        >
                          ▲ {q.upvotes || 0}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {q.replies && q.replies.length > 0 ? (
                        q.replies.map((r) => (
                          <div
                            key={r._id}
                            className="bg-white rounded px-3 py-2 text-sm border flex gap-2 items-start"
                          >
                            {r.authorImageUrl && (
                              <img
                                src={r.authorImageUrl}
                                alt={r.authorName || "User"}
                                className="w-6 h-6 rounded-full object-cover mt-0.5"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            )}

                            <div className="flex-1">
                              {editingReplyId === r._id ? (
                                <div className="space-y-2">
                                  <textarea
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    rows={2}
                                    value={editingReplyText}
                                    onChange={(e) =>
                                      setEditingReplyText(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateReply(q._id, r._id)
                                      }
                                      className="text-xs px-2 py-1 rounded bg-green-600 text-white"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditReply}
                                      className="text-xs px-2 py-1 rounded bg-gray-300"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p>{r.text}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-slate-500">
                                      {r.authorName || "User"} •{" "}
                                      {new Date(
                                        r.createdAt
                                      ).toLocaleString()}
                                    </p>
                                    {r.authorId === authorId && (
                                      <div className="flex gap-2 text-[11px]">
                                        <button
                                          type="button"
                                          onClick={() => startEditReply(r)}
                                          className="text-blue-600 hover:underline"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteReply(q._id, r._id)
                                          }
                                          className="text-red-500 hover:underline"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] text-slate-400">
                          No replies yet. Start the discussion.
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t mt-2">
                      <input
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Write a reply..."
                        value={replyText[q._id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [q._id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleReply(q._id)}
                        className="bg-[#6c3cf0] hover:bg-[#5a32c7] text-white px-4 py-2 rounded text-sm"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyQueryForumPage;

