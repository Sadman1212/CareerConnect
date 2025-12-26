// src/pages/AddJobPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const initialState = {
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

const AddJobPage = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // NEW
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancel = () => navigate("/company-dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/jobs", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/company/posted-jobs");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create job"
      );
    } finally {
      setLoading(false);
    }
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

          {/* menu button + dropdown */}
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

      <main className="flex-1 flex justify-center items-start bg-gradient-to-b from-slate-200 to-slate-400 py-10">
        <div className="w-full max-w-5xl mx-4">
          {/* white box */}
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 relative">
            {/* header row */}
            <div className="flex items-center justify-between mb-6">
              <button className="bg-[#5b4ce6] text-white px-6 py-2 rounded shadow-md text-sm font-semibold">
                Job Details
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-[#c62828] hover:bg-[#b71c1c] text-white px-6 py-2 rounded shadow-md text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-job-form"
                  disabled={loading}
                  className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-6 py-2 rounded shadow-md text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            {/* form */}
            <form
              id="add-job-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* top inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-pink-700 mb-1">
                    Job title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Law">Law</option>
                    <option value="BBA">BBA</option>
                    <option value="MNS">MNS</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Economics">Economics</option>
                    <option value="English and Humanities">
                      English and Humanities
                    </option>
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-pink-700 mb-1">
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              {/* large textareas */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-pink-700 mb-1">
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    rows={8}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-pink-700 mb-1">
                    Job Requirements
                  </label>
                  <textarea
                    name="requirements"
                    rows={8}
                    value={formData.requirements}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-pink-700 mb-1">
                    Job Benefits
                  </label>
                  <textarea
                    name="benefits"
                    rows={8}
                    value={formData.benefits}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              {/* bottom row */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-pink-700 mb-1">
                    Work experience
                  </label>
                  <textarea
                    name="experience"
                    rows={4}
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-pink-700 mb-1">
                    Salary Range
                  </label>
                  <input
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddJobPage;






