import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const emptyState = {
  title: "",
  category: "Full-time",
  department: "Any",
  studentCategory: "Undergraduate",
  gender: "Any",
  deadline: "",
  address: "",
  description: "",
  requirements: "",
  benefits: "",
  experience: "",
  salaryRange: "",
};

const EditJobPage = () => {
  const [formData, setFormData] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/jobs/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const job = res.data || {};
        setFormData({
          title: job.title || "",
          category: job.category || "Full-time",
          department: job.department || "Any",
          studentCategory: job.studentCategory || "Undergraduate",
          gender: job.gender || "Any",
          deadline: job.deadline ? job.deadline.slice(0, 10) : "",
          address: job.address || "",
          description: job.description || "",
          requirements: job.requirements || "",
          benefits: job.benefits || "",
          experience: job.experience || "",
          salaryRange: job.salaryRange || "",
        });
      } catch (err) {
        console.error("Load job error:", err.response?.status, err.response?.data);
        alert(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load job"
        );
        navigate("/company/posted-jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/jobs/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/company/posted-jobs");
    } catch (err) {
      console.error("Update job error:", err.response?.status, err.response?.data);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update job"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/company/posted-jobs");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* top bar kept */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-full px-3 py-1">
            <span className="text-gray-500 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
          <button
            className="text-2xl font-bold"
            onClick={() => navigate("/company-dashboard")}
          >
            ☰
          </button>
        </div>
      </header>

      {/* main area without sidebar */}
      <main className="flex-1 bg-gradient-to-b from-slate-200 to-slate-400 py-10 flex justify-center">
        <div className="w-full max-w-5xl px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl p-6 md:p-8 space-y-6"
          >
            {/* Job Details tab + Cancel/Save */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                className="px-4 py-1 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow"
              >
                Job Details
              </button>

              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Job Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Law">Law</option>
                  <option value="BBA">BBA</option>
                  <option value="MNS">MNS</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Economics">Economics</option>
                  <option value="English and Humanities">English and Humanities</option>
                  <option value="General Education">General Education</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Student Category
                </label>
                <select
                  name="studentCategory"
                  value={formData.studentCategory}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Job Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Job Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Job Benefits
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Job Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditJobPage;



