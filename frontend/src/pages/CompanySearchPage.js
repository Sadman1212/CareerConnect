import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

const CompanySearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initial = searchParams.get("q") || "";
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // debounce
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!q) {
      setResults([]);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      fetchResults(q);
    }, 300);
    return () => clearTimeout(timeoutRef.current);
  }, [q]);

  const fetchResults = async (term) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/user/search?search=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openUserProfile = (user) => {
    const id = user._id || user.id;
    navigate(`/user-profile/${id}`, { state: { user } });
  };

  const goBack = () => {
    navigate("/company-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full bg-blue-900 text-white px-8 py-4 shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-semibold">CareerConnect - Search Users</h1>
        <button 
          onClick={goBack}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Search Users</h2>
        <div className="flex items-center gap-2 mb-4">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by user name..."
            className="w-full px-4 py-2 border border-gray-300 rounded text-sm"
          />
          <button onClick={() => setQ("")} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm font-medium">Clear</button>
        </div>

        <div className="mt-6">
          {loading && <div className="text-sm text-gray-500 text-center py-4">Searching...</div>}

          {!loading && results.length === 0 && q && (
            <div className="text-sm text-gray-500 text-center py-4">No users found. Try another search.</div>
          )}

          {!loading && results.length === 0 && !q && (
            <div className="text-sm text-gray-400 text-center py-8">Start typing to search for users</div>
          )}

          <ul className="space-y-3">
            {results.map((user) => {
              const id = user._id || user.id;
              return (
                <li key={id} className="p-4 border border-gray-200 rounded hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <img src={user.imageUrl || ""} alt="profile" className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800">{user.fullName || user.name || "User"}</div>
                      <div className="text-xs text-gray-500">{user.email || "Email not available"}</div>
                      {user.skills && user.skills.trim() !== "" && (
                        <div className="text-xs text-gray-600 mt-1">
                          Skills: {user.skills}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openUserProfile(user)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium">View Profile</button>
                    </div>
                  </div>

                </li>
              );
            })}
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CompanySearchPage;
