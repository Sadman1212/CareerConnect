import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { API_BASE_URL } from "../config";
import { FaTrash, FaUser, FaBuilding, FaBriefcase } from "react-icons/fa";

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");

  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pending, setPending] = useState([]);

  const [loading, setLoading] = useState(true);
  const [panelTab, setPanelTab] = useState("users");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, companiesRes, jobsRes, pendingJobsRes, pendingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/users`, { headers }),
          fetch(`${API_BASE_URL}/admin/companies`, { headers }),
          fetch(`${API_BASE_URL}/admin/jobs`, { headers }),
          fetch(`${API_BASE_URL}/admin/pending-jobs`, { headers }),
          fetch(`${API_BASE_URL}/admin/pending`, { headers }),
        ]);

        const usersData = await usersRes.json();
        const companiesData = await companiesRes.json();
        const jobsData = await jobsRes.json();
        const pendingJobsData = await pendingJobsRes.json();
        const pendingData = await pendingRes.json();

        setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
        setCompanies(Array.isArray(companiesData) ? companiesData : companiesData.companies || []);
        setJobPosts(Array.isArray(jobsData) ? jobsData : jobsData.jobs || []);
        setPendingJobs(Array.isArray(pendingJobsData) ? pendingJobsData : []);

        const pendingCompanies = Array.isArray(pendingData.pendingCompanies)
          ? pendingData.pendingCompanies
          : (pendingData.pendingCompanies?.data || []);
        const pendingUsers = Array.isArray(pendingData.pendingUsers)
          ? pendingData.pendingUsers
          : (pendingData.pendingUsers?.data || []);

        setPending([...pendingCompanies, ...pendingUsers]);
      } catch (err) {
        console.error("Admin panel fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, navigate]);

  const handleDelete = async (type, id, isPending = false) => {
    if (!window.confirm("Are you sure?")) return;

    const map = { users: "user", companies: "company", jobs: "jobs" };

    try {
      let endpoint = `${API_BASE_URL}/admin/${map[type]}/${id}`;

      // For pending requests, use different endpoints
      if (isPending) {
        if (type === "companies") {
          endpoint = `${API_BASE_URL}/admin/pending-company/${id}`;
        } else if (type === "users") {
          endpoint = `${API_BASE_URL}/admin/pending-user/${id}`;
        }
      }

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (type === "users" && !isPending) setUsers((p) => p.filter((u) => u._id !== id));
        if (type === "companies" && !isPending) setCompanies((p) => p.filter((c) => c._id !== id));
        if (type === "jobs") setJobPosts((p) => p.filter((j) => j._id !== id));
        if (isPending) setPending((p) => p.filter((item) => item._id !== id));
      }
    } catch {}
  };

  return (
    <AdminLayout profile={profile}>
      {/* panel top section */}
      <div className="bg-white shadow-lg rounded-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Admin Panel</h2>
            <p className="text-sm text-gray-600">Manage users, companies and job posts.</p>
          </div>

          <div className="flex gap-2">
            {["users", "companies", "jobs", "pending-jobs", "pending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setPanelTab(tab)}
                className={`px-3 py-1 rounded ${
                  panelTab === tab ? "bg-indigo-600 text-white" : "bg-gray-100"
                }`}
              >
                {tab === "pending-jobs" ? "Pending Jobs" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="bg-white p-6 rounded-md shadow">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-md shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
              <FaUser />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Users</h3>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>

          <div className="p-4 rounded-md shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">
              <FaBuilding />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Companies</h3>
              <p className="text-2xl font-bold">{companies.length}</p>
            </div>
          </div>

          <div className="p-4 rounded-md shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl">
              <FaBriefcase />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Job Posts</h3>
              <p className="text-2xl font-bold">{jobPosts.length}</p>
            </div>
          </div>
        </div>

        {/* table */}
        {!loading && (
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="border-b bg-gray-50">
                {panelTab === "users" &&
                  ["Avatar", "Name", "Email", "Role", "Action"].map((col) => (
                    <th key={col} className="py-2 px-3 text-left border-b border-gray-200">
                      {col}
                    </th>
                  ))}

                {panelTab === "companies" &&
                  ["Company Name", "Email", "Action"].map((col) => (
                    <th key={col} className="py-2 px-3 text-left">{col}</th>
                  ))}

                {panelTab === "jobs" &&
                  ["Job Title", "Company", "Action"].map((col) => (
                    <th key={col} className="py-2 px-3 text-left">{col}</th>
                  ))}

                {panelTab === "pending-jobs" &&
                  ["Job Title", "Company", "Created", "Action"].map((col) => (
                    <th key={col} className="py-2 px-3 text-left">{col}</th>
                  ))}

                {panelTab === "pending" &&
                  ["Title", "Type", "Action"].map((col) => (
                    <th key={col} className="py-2 px-3 text-left">{col}</th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {panelTab === "users" &&
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-100">
                    <td className="py-2 px-3">
                      <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                        {u.name[0]}
                      </div>
                    </td>
                    <td className="py-2 px-3">{u.name}</td>
                    <td className="py-2 px-3">{u.email}</td>
                    <td className="py-2 px-3">{u.role}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleDelete("users", u._id)}
                        className="text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}

              {panelTab === "companies" &&
                companies.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-100">
                    <td className="py-2 px-3">{c.companyName || c.name || "N/A"}</td>
                    <td className="py-2 px-3">{c.email}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleDelete("companies", c._id)}
                        className="text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}

              {panelTab === "jobs" &&
                jobPosts.map((j) => (
                  <tr key={j._id} className="hover:bg-gray-100">
                    <td className="py-2 px-3">{j.title}</td>
                    <td className="py-2 px-3">{j.company?.companyName || "N/A"}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleDelete("jobs", j._id)}
                        className="text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}

              {panelTab === "pending-jobs" &&
                pendingJobs.map((j) => (
                  <tr key={j._id} className="hover:bg-gray-100">
                    <td className="py-2 px-3">{j.title}</td>
                    <td className="py-2 px-3">{j.company?.companyName || "N/A"}</td>
                    <td className="py-2 px-3">
                      {new Date(j.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleDelete("jobs", j._id)}
                        className="text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}

              {panelTab === "pending" &&
                pending.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-100">
                    <td className="py-2 px-3">{p.companyName || p.name || "Pending Item"}</td>
                    <td className="py-2 px-3">{p.companyName ? "Company" : "User"}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleDelete(p.companyName ? "companies" : "users", p._id, true)}
                        className="text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPanelPage;
