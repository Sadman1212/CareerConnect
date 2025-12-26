// frontend/src/pages/AddCareerEventPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const AddCareerEventPage = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams(); // if present => edit mode

  const storedProfile = localStorage.getItem("profile");
  const companyProfile = storedProfile ? JSON.parse(storedProfile) : null;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    eventName: "",
    eventSubtitle: "",
    coverImageUrl: "",
    eventWebsite: "",
    eventType: "",
    companyName: companyProfile?.name || companyProfile?.companyName || "",
    eventDetails: "",
    eventDeadline: "",
    eventDate: "",
    eventPlace: "",
  });

  const [activityList, setActivityList] = useState([{ name: "", time: "" }]);

  const isEditMode = Boolean(eventId);

  // Redirect if not logged in as company
  useEffect(() => {
    const token = localStorage.getItem("token");
    const profile = companyProfile;
    if (!token || !profile || profile.role !== "company") {
      alert(
        "Only company accounts can manage career events. Please login as company."
      );
      navigate("/login");
    }
  }, [companyProfile, navigate]);

  // If editing, load existing event
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        setInitialLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/career-events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const ev = res.data;
        setFormData({
          eventName: ev.eventName || "",
          eventSubtitle: ev.eventSubtitle || "",
          coverImageUrl: ev.coverImageUrl || "",
          eventWebsite: ev.eventWebsite || "",
          eventType: ev.eventType || "",
          companyName:
            ev.companyName ||
            companyProfile?.name ||
            companyProfile?.companyName ||
            "",
          eventDetails: ev.eventDetails || "",
          eventDeadline: ev.eventDeadline ? ev.eventDeadline.slice(0, 10) : "",
          eventDate: ev.eventDate ? ev.eventDate.slice(0, 10) : "",
          eventPlace: ev.eventPlace || "",
        });
        setActivityList(
          ev.activityList && ev.activityList.length > 0
            ? ev.activityList.map((a) => ({
                name: a.name || "",
                time: a.time || "",
              }))
            : [{ name: "", time: "" }]
        );
      } catch (err) {
        console.error("Error loading event:", err);
        alert(
          err.response?.data?.message || "Failed to load event for editing"
        );
        navigate("/company/posted-career-events");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, companyProfile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActivityChange = (index, field, value) => {
    setActivityList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addActivityRow = () => {
    setActivityList((prev) => [...prev, { name: "", time: "" }]);
  };

  const removeActivityRow = (index) => {
    setActivityList((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setCoverUploading(true);
      setError("");
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("image", file); // backend expects "image"

      const res = await axios.post(
        `${API_BASE_URL}/company/upload-image`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const url = res.data?.imageUrl;
      if (!url) {
        throw new Error("Image upload response missing URL");
      }

      setFormData((prev) => ({
        ...prev,
        coverImageUrl: url,
      }));
    } catch (err) {
      console.error("Cover upload error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to upload cover image. Please try again."
      );
    } finally {
      setCoverUploading(false);
    }
  };

  const validateForm = () => {
    const {
      eventName,
      eventSubtitle,
      coverImageUrl,
      eventWebsite,
      eventType,
      companyName,
      eventDetails,
      eventDeadline,
      eventDate,
      eventPlace,
    } = formData;

    if (
      !eventName ||
      !eventSubtitle ||
      !coverImageUrl ||
      !eventWebsite ||
      !eventType ||
      !companyName ||
      !eventDetails ||
      !eventDeadline ||
      !eventDate ||
      !eventPlace
    ) {
      return "Please fill in all required fields.";
    }

    if (
      !activityList ||
      !Array.isArray(activityList) ||
      activityList.length === 0
    ) {
      return "Please add at least one activity.";
    }

    if (activityList.some((a) => !a.name || !a.time)) {
      return "Every activity must have a name and time.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMsg = validateForm();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      // companyProfile from localStorage: { id, name, role, ... }
      const companyId =
        companyProfile?.id ||
        companyProfile?._id ||
        companyProfile?.companyId;

      if (!companyId) {
        throw new Error(
          "Company ID not found in profile. Please log out and log in again."
        );
      }

      const payload = {
        company: companyId, // REQUIRED by schema
        companyName: formData.companyName,
        eventName: formData.eventName,
        eventSubtitle: formData.eventSubtitle,
        coverImageUrl: formData.coverImageUrl,
        eventWebsite: formData.eventWebsite,
        eventType: formData.eventType,
        eventDetails: formData.eventDetails,
        eventDeadline: formData.eventDeadline,
        eventDate: formData.eventDate,
        eventPlace: formData.eventPlace,
        activityList,
      };

      if (!isEditMode) {
        await axios.post(`${API_BASE_URL}/career-events`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Career event posted successfully.");
      } else {
        await axios.put(
          `${API_BASE_URL}/career-events/${eventId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Career event updated successfully.");
      }

      navigate("/company/posted-career-events");
    } catch (err) {
      console.error("Error saving event:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save career event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/company/posted-career-events");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading event...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Simple top bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>
        <span className="text-sm opacity-80">
          {isEditMode ? "Edit Career Event" : "Create Career Event"}
        </span>
      </header>

      <main className="flex-1 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 flex justify-center items-start py-10 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
          {/* Header row with buttons */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Edit Career Event" : "Add a new Career Event"}
            </h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || coverUploading}
                className="px-5 py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {loading ? "Saving..." : isEditMode ? "Update" : "Post"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event name + subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Event name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter event name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Event subtitle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventSubtitle"
                  value={formData.eventSubtitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Short subtitle for the event"
                  required
                />
              </div>
            </div>

            {/* Cover photo */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Event cover photo <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <label className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md cursor-pointer hover:bg-indigo-700 transition">
                  {coverUploading ? "Uploading..." : "Upload cover image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={coverUploading}
                  />
                </label>
                {formData.coverImageUrl && (
                  <img
                    src={formData.coverImageUrl}
                    alt="Event cover"
                    className="w-full max-w-xs rounded-lg border shadow-sm object-cover"
                  />
                )}
              </div>
            </div>

            {/* Website + type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Event website <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventWebsite"
                  value={formData.eventWebsite}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://example.com/event"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Event type <span className="text-red-500">*</span>
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Career Fair">Career Fair</option>
                  <option value="Webinar">Webinar</option>
                  <option value="On-site Visit">On-site Visit</option>
                  <option value="Information Session">
                    Information Session
                  </option>
                </select>
              </div>
            </div>

            {/* Company name */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Company organizing the event"
                required
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Event details <span className="text-red-500">*</span>
              </label>
              <textarea
                name="eventDetails"
                value={formData.eventDetails}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md min-h-[120px]"
                placeholder="Describe the event, agenda, speakers, and what students can expect."
                required
              />
            </div>

            {/* Dates + place */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Event deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="eventDeadline"
                  value={formData.eventDeadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Event date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Event place <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventPlace"
                  value={formData.eventPlace}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Campus auditorium, online, etc."
                  required
                />
              </div>
            </div>

            {/* Activity list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold">
                  Activity list <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addActivityRow}
                  className="px-3 py-1 text-xs rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  + Add activity
                </button>
              </div>
              <div className="space-y-2">
                {activityList.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Activity name"
                      value={row.name}
                      onChange={(e) =>
                        handleActivityChange(index, "name", e.target.value)
                      }
                      className="col-span-6 px-3 py-2 border rounded-md text-sm"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Time (e.g., 10:00 AM – 10:30 AM)"
                      value={row.time}
                      onChange={(e) =>
                        handleActivityChange(index, "time", e.target.value)
                      }
                      className="col-span-5 px-3 py-2 border rounded-md text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeActivityRow(index)}
                      className="col-span-1 px-2 py-2 text-xs rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddCareerEventPage;
