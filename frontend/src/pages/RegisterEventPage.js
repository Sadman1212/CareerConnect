// frontend/src/pages/RegisterEventPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const RegisterEventPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const storedProfile = localStorage.getItem("profile");
  const userProfile = storedProfile ? JSON.parse(storedProfile) : null;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: userProfile?.name || "",
    mobileNumber: "",
    institution: "",
    email: userProfile?.email || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/event-registrations/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const foundEvent = res.data.find((e) => e._id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          alert("Event not found");
          navigate("/view-career-events");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        alert("Failed to load event details");
        navigate("/view-career-events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10,15}$/.test(formData.mobileNumber.replace(/[\s-]/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    if (!formData.institution.trim()) {
      newErrors.institution = "Institution name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/event-registrations/register`,
        {
          eventId: eventId,
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          institution: formData.institution,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
    } catch (err) {
      console.error("Error submitting registration:", err);
      alert(
        err.response?.data?.message ||
          "Failed to submit registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-xl font-bold text-gray-700 mt-4">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">📧</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Check Your Email!
          </h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            We've sent a verification email to <strong className="text-indigo-600">{formData.email}</strong>
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <p className="text-base text-gray-700 mb-4">
              <strong>📋 Next Steps:</strong>
            </p>
            <ol className="text-left text-gray-700 space-y-2 pl-6">
              <li>✅ Check your email inbox (and spam folder)</li>
              <li>✅ Open the email from CareerConnect</li>
              <li>✅ Click the "Confirm Email" button</li>
              <li>✅ Complete your registration</li>
            </ol>
          </div>
          <button
            onClick={() => navigate("/view-career-events")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/view-career-events")}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4 transition"
          >
            <span className="text-xl">←</span>
            Back to Events
          </button>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Register for Event
          </h1>
          <p className="text-xl text-gray-600">
            Fill out the form below to register for this amazing event
          </p>
        </div>

        {/* Event Info Card */}
        {event && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 border-indigo-100">
            <div className="flex items-start gap-6">
              {event.coverImageUrl && (
                <img
                  src={event.coverImageUrl}
                  alt={event.eventName}
                  className="w-32 h-32 rounded-2xl object-cover shadow-md"
                />
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  {event.eventName}
                </h2>
                <p className="text-gray-600 mb-4">{event.eventSubtitle}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold">
                    📅 {new Date(event.eventDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold">
                    🏢 {event.companyName}
                  </span>
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">
                    📍 {event.eventPlace}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <h3 className="text-3xl font-black text-gray-900 mb-8 text-center">
            Registration Form
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-2 font-semibold">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.mobileNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your mobile number"
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm mt-2 font-semibold">
                  {errors.mobileNumber}
                </p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.institution ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your institution name"
              />
              {errors.institution && (
                <p className="text-red-500 text-sm mt-2 font-semibold">
                  {errors.institution}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 font-semibold">
                  {errors.email}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                📧 We'll send a verification email to this address
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
              <p className="text-sm text-gray-700 font-semibold flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <span>
                  All fields are mandatory. You must verify your email address to complete the registration.
                </span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 rounded-2xl font-black text-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">✅</span>
                  Register Now
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterEventPage;
