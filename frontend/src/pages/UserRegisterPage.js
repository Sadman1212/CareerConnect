import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/auth";

// password must have at least 1 letter, 1 number, 1 special char
const isStrongPassword = (pwd) => {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pwd);
};

const UserRegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    gender: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    studentType: "",
    department: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // front-end required validation
    if (
      !form.name.trim() ||
      !form.gender ||
      !form.email.trim() ||
      !form.mobile.trim() ||
      !form.password ||
      !form.confirmPassword ||
      !form.studentType ||
      !form.department ||
      !imageFile
    ) {
      setMessage("All fields, including profile image, are required");
      return;
    }

    if (!isStrongPassword(form.password)) {
      setMessage(
        "Password must contain at least 6 characters including  letter,number, special character"
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("gender", form.gender);
      formData.append("email", form.email);
      formData.append("mobile", form.mobile);
      formData.append("password", form.password);
      formData.append("studentType", form.studentType);
      formData.append("department", form.department);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE}/register-user`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setMessage("Account created successfully");
      setLoading(false);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      <header className="w-full bg-blue-900 text-white flex items-center px-10 py-4 shadow-md">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-8 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute right-6 top-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4 py-1 rounded-full shadow"
          >
            Back
          </button>

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Create user account
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gender select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <span className="text-[11px] text-gray-500 ml-2">
                    At least 6 characters including letter,number and special character.
                  </span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Re-enter password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Student Type select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Type
                </label>
                <select
                  name="studentType"
                  value={form.studentType}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              {/* Department select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Law">Law</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="BBA">BBA</option>
                  <option value="Economics">Economics</option>
                  <option value="MNS">MNS</option>
                  <option value="English & Humanities">
                    English & Humanities
                  </option>
                  <option value="General Education">General Education</option>
                </select>
              </div>

              {message && (
                <p className="text-sm text-red-600 mt-2">{message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            {/* Image upload */}
            <div className="flex flex-col items-center justify-start space-y-4">
              <div className="w-32 h-32 rounded-md bg-gray-100 flex items-center justify-center shadow-inner overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Profile image</span>
                )}
              </div>

              <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserRegisterPage;




