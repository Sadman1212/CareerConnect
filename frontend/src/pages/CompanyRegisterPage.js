import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

// password must have at least 1 letter, 1 number, 1 special char
const isStrongPassword = (pwd) => {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pwd);
};

const CompanyRegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    establishmentYear: "",
    contactNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    industryType: "",
    address: "",
    licenseNo: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // front-end required validation
    if (
      !form.companyName.trim() ||
      !form.establishmentYear ||
      !form.contactNo.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword ||
      !form.industryType ||
      !form.address.trim() ||
      !form.licenseNo.trim() ||
      !logoFile
    ) {
      setMessage("All fields, including company logo, are required");
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
      formData.append("companyName", form.companyName);
      formData.append("establishmentYear", form.establishmentYear);
      formData.append("contactNo", form.contactNo);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("industryType", form.industryType);
      formData.append("address", form.address);
      formData.append("licenseNo", form.licenseNo);
      if (logoFile) {
        formData.append("image", logoFile); // must match upload.single("image")
      }

      const res = await fetch(`${API_BASE_URL}/auth/register-company`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setMessage("Company account created successfully");
      setLoading(false);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
      setLoading(false);
    }
  };

  // Establishment year options: 2026 down to 1900
  const yearOptions = [];
  for (let y = 2026; y >= 1900; y--) {
    yearOptions.push(y);
  }

  // Fixed industry types
  const industryOptions = [
    "Agro based Industry",
    "Airline/ Travel/ Tourism",
    "Architecture/ Engineering/ Construction",
    "Automobile/Industrial Machine",
    "Bank/ Non-Bank Fin. Institution",
    "E-commerce/F-commerce",
    "Education",
    "Electronics/ Consumer Durables",
    "Energy/ Power/ Fuel",
    "Entertainment/ Recreation",
    "Fire, Safety & Protection",
    "Food & Beverage Industry",
    "Garments/ Textile",
    "Govt./ Semi-Govt./ Autonomous",
    "Hospital/ Diagnostic Center",
    "Hotel/Restaurant",
    "Information Technology (IT)",
    "Logistics/ Transportation",
    "Manufacturing (Heavy Industry)",
    "Manufacturing (Light Industry)",
    "Media (Satellite/ Print/ Online)/ Advertising/ Event Mgt.",
    "NGO/Development",
    "Pharmaceuticals",
    "Real Estate/ Development",
    "Security Service",
    "Telecommunication",
    "Wholesale/ Retail/ Export-Import",
    "Others",
  ];

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
            Create company account
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Establishment Year select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Establishment Year
                </label>
                <select
                  name="establishmentYear"
                  value={form.establishmentYear}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact No
                </label>
                <input
                  type="text"
                  name="contactNo"
                  value={form.contactNo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

              {/* Confirm Password */}
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

              {/* Industry Type select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry Type
                </label>
                <select
                  name="industryType"
                  value={form.industryType}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry</option>
                  {industryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* License No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License No
                </label>
                <input
                  type="text"
                  name="licenseNo"
                  value={form.licenseNo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

            {/* Logo upload */}
            <div className="flex flex-col items-center justify-start space-y-4">
              <div className="w-32 h-32 rounded-md bg-gray-100 flex items-center justify-center shadow-inner overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Company logo</span>
                )}
              </div>

              <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
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

export default CompanyRegisterPage;





