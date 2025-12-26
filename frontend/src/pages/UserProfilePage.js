import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
// 🔔 SOCKET.IO
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", { transports: ["websocket"] });

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const storedProfile = localStorage.getItem("profile");
  const initialProfile = storedProfile ? JSON.parse(storedProfile) : null;
  const token = localStorage.getItem("token");
  
  // Determine if we're viewing another user's profile or our own
  const isViewingOtherUser = !!userId && userId !== initialProfile?.id;

  // State for profile data
  const [profile, setProfile] = useState(isViewingOtherUser ? null : initialProfile);
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for menu dropdown
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔔 NOTIFICATION STATE
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // State for PDF viewer modal
  const [pdfViewer, setPdfViewer] = useState({
    isOpen: false,
    pdfUrl: null,
    title: ""
  });

  // State for image viewer modal
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    imageUrl: null,
    title: ""
  });

  // State for delete account modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    password: "",
    loading: false
  });

  // State for form data (edit mode)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    currentAddress: "",
    academicBackground: "",
    cgpa: "",
    skills: "",
    projectLink: "",
    linkedinLink: "",
    studentType: "",
    department: ""
  });

  // State for file uploads
  const [files, setFiles] = useState({
    profilePhoto: null,
    certificate: null,
    cv: null
  });

  // State for file previews
  const [filePreviews, setFilePreviews] = useState({
    profilePhoto: null,
    certificate: null,
    cv: null
  });

  // Load profile data into form when entering edit mode
  useEffect(() => {
    if (profile && isEditing) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        mobile: profile.mobile || "",
        gender: profile.gender || "",
        currentAddress: profile.currentAddress || "",
        academicBackground: profile.academicBackground || "",
        cgpa: profile.cgpa || "",
        skills: profile.skills || "",
        projectLink: profile.projectLink || "",
        linkedinLink: profile.linkedinLink || "",
        studentType: profile.studentType || "",
        department: profile.department || ""
      });
    }
  }, [isEditing, profile]);

  // Fetch other user's profile when viewing their profile
  useEffect(() => {
    if (isViewingOtherUser && userId) {
      const fetchOtherUserProfile = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfile(res.data);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          navigate("/");
        }
      };
      fetchOtherUserProfile();
    }
  }, [userId, isViewingOtherUser, token, navigate]);

  // 🔔 FETCH NOTIFICATIONS ON MOUNT
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // 🔔 SOCKET NOTIFICATIONS
  useEffect(() => {
    socket.on("notification", async (data) => {
      // Fetch fresh notifications and unread count
      await fetchNotifications();
      await fetchUnreadCount();
      // Show browser alert
      alert(`🔔 ${data.title}\n${data.message}`);
    });

    return () => socket.off("notification");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  // 🔔 NOTIFICATION FUNCTIONS
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications/unread-count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's an image or PDF for certificate and CV
      if (fieldName === 'certificate' || fieldName === 'cv') {
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";
        
        if (!isImage && !isPDF) {
          alert("Please select an image or PDF file only!");
          return;
        }
      } else if (fieldName === 'profilePhoto') {
        // Profile photo should only be image
        if (!file.type.startsWith("image/")) {
          alert("Please select an image file only for profile photo!");
          return;
        }
      }

      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // Create preview (only for images)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => ({
            ...prev,
            [fieldName]: reader.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, store filename info
        setFilePreviews(prev => ({
          ...prev,
          [fieldName]: "PDF_SELECTED"
        }));
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Email validation
      if (formData.email && !formData.email.includes('@')) {
        alert("Please enter a valid email address");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("gender", formData.gender);
      
      // Append text fields
      formDataToSend.append("currentAddress", formData.currentAddress);
      formDataToSend.append("academicBackground", formData.academicBackground);
      formDataToSend.append("cgpa", formData.cgpa);
      formDataToSend.append("skills", formData.skills);
      formDataToSend.append("projectLink", formData.projectLink);
      formDataToSend.append("linkedinLink", formData.linkedinLink);
      formDataToSend.append("studentType", formData.studentType);
      formDataToSend.append("department", formData.department);

      // Append files if selected
      if (files.profilePhoto) {
        formDataToSend.append("profilePhoto", files.profilePhoto);
      }
      if (files.certificate) {
        formDataToSend.append("certificate", files.certificate);
      }
      if (files.cv) {
        formDataToSend.append("cv", files.cv);
      }

      // Send to backend using API_BASE_URL from config
      const response = await axios.put(
        `${API_BASE_URL}/auth/update-profile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Update localStorage with new profile data
      const updatedProfile = response.data.profile;
      localStorage.setItem("profile", JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      // Exit edit mode
      setIsEditing(false);

      // Reset file states
      setFiles({
        profilePhoto: null,
        certificate: null,
        cv: null
      });
      setFilePreviews({
        profilePhoto: null,
        certificate: null,
        cv: null
      });

      alert("Profile updated successfully!");

    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form and file states
    setFiles({
      profilePhoto: null,
      certificate: null,
      cv: null
    });
    setFilePreviews({
      profilePhoto: null,
      certificate: null,
      cv: null
    });
  };

  const handleDeleteAccount = async () => {
    if (!deleteModal.password) {
      alert("Please enter your password");
      return;
    }

    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(`${API_BASE_URL}/auth/delete-account`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          password: deleteModal.password
        }
      });

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("profile");

      alert("Account deleted successfully");
      
      // Redirect to home page
      navigate("/");

    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error.response?.data?.message || "Failed to delete account");
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // ✅ NEW: Open PDF in new tab
  const openPdfInNewTab = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  // ✅ UPDATED: Open image viewer
  const openImageViewer = (imageUrl, title) => {
    setImageViewer({
      isOpen: true,
      imageUrl,
      title
    });
  };

  const closeImageViewer = () => {
    setImageViewer({
      isOpen: false,
      imageUrl: null,
      title: ""
    });
  };

  // ✅ NEW: Check if file is PDF
  const isPdfFile = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
  };

  const avatarUrl = profile?.imageUrl || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Top bar */}
      <header className="w-full flex items-center justify-between px-8 py-3 bg-slate-900 text-white relative">
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

          {/* 🔔 NOTIFICATION BUTTON */}
          <div className="relative">
            <button
              className="text-2xl font-bold relative hover:opacity-80"
              onClick={() => setNotificationOpen((prev) => !prev)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popup */}
            {notificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white text-gray-800 rounded-md shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-indigo-500 text-white px-4 py-3 flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <span
                    className="cursor-pointer text-lg"
                    onClick={() => setNotificationOpen(false)}
                  >
                    ✕
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                          !notif.isRead ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => markAsRead(notif._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📅 GOOGLE CALENDAR BUTTON */}
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl hover:opacity-80 transition"
            title="Open Google Calendar"
          >
            📅
          </a>

          <button
            className="text-2xl font-bold relative"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-md shadow-lg py-2 w-40 z-10">
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
      </header>

      {/* MAIN FLEX AREA */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-52 bg-slate-900 text-white pt-6">
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
              {profile?.name || "User"}
            </span>
          </div>

          <nav className="flex flex-col text-sm">
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/user-dashboard")}
            >
              Home
            </button>
            <button 
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/applied-jobs")}
            >
              Applied Jobs
            </button>
            <button className="text-left px-4 py-2 hover:bg-slate-800">
              Followed Jobs
            </button>
            <button className="text-left px-4 py-2 hover:bg-slate-800">
              Messages
            </button>
            <button className="text-left px-4 py-2 hover:bg-slate-800">
              Query Forum
            </button>
            <button className="text-left px-4 py-2 bg-indigo-600">
              Profile
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-gradient-to-b from-gray-100 to-gray-300 p-6 overflow-auto">
          {profile && (
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-auto p-8">
              {/* Header with Edit/Save/Cancel buttons */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {isEditing ? "Edit Student Profile" : "Student Profile"}
                </h2>
                
                {!isViewingOtherUser && (
                  <>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition font-semibold"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveProfile}
                          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold"
                        >
                          Save Profile
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Profile Photo Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {filePreviews.profilePhoto ? (
                    <img
                      src={filePreviews.profilePhoto}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 cursor-pointer"
                      onClick={() => !isEditing && openImageViewer(filePreviews.profilePhoto, "Profile Photo")}
                    />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 cursor-pointer hover:opacity-90 transition"
                      onClick={() => !isEditing && openImageViewer(avatarUrl, "Profile Photo")}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-4xl text-gray-500">📷</span>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <label className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-red-700 transition font-semibold">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "profilePhoto")}
                    />
                  </label>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile.name}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile.email}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Mobile Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile.mobile}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={profile.gender}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                  )}
                </div>
              </div>

              {/* Student Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Student Type</label>
                {isEditing ? (
                  <select
                    name="studentType"
                    value={formData.studentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select type</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={profile.studentType || ""}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                )}
              </div>

              {/* Current Address */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Current Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your current address"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <input
                    type="text"
                    value={profile.currentAddress || ""}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                )}
              </div>

              {/* Academic Information Section */}
              <h3 className="text-lg font-bold mb-4 mt-8">Academic Information</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Academic Background</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="academicBackground"
                      value={formData.academicBackground}
                      onChange={handleInputChange}
                      placeholder="e.g., BSc in Computer Science"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile.academicBackground || ""}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-50"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">CGPA</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      placeholder="e.g., 3.75"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile.cgpa || ""}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-50"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Department/Program</label>
                  {isEditing ? (
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
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
                      <option value="English & Humanities">English & Humanities</option>
                      <option value="General Education">General Education</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={profile.department}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-50"
                    />
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Skills</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g., React, Node.js, MongoDB, Python"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <input
                    type="text"
                    value={profile.skills || ""}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                )}
              </div>

              {/* ✅ MODIFIED: File Uploads Section - SHOWS EXISTING FILES IN EDIT MODE */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Certificate Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Certificate (Image or PDF)</label>
                  {isEditing ? (
                    <>
                      {/* Show existing file if no new file selected */}
                      {!files.certificate && profile.certificateUrl && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800 mb-2">Current Certificate:</p>
                          {isPdfFile(profile.certificateUrl) ? (
                            <button
                              onClick={() => openPdfInNewTab(profile.certificateUrl)}
                              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition text-sm"
                            >
                              <span className="text-xl">📄</span>
                              View Current PDF
                            </button>
                          ) : (
                            <img
                              src={profile.certificateUrl}
                              alt="Current Certificate"
                              className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                              onClick={() => openImageViewer(profile.certificateUrl, "Current Certificate")}
                            />
                          )}
                          <p className="text-xs text-gray-600 mt-2">Upload a new file to replace this</p>
                        </div>
                      )}

                      {/* Upload new file */}
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-400 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                        <span className="text-4xl mb-2">📄</span>
                        <span className="text-sm text-purple-600 font-semibold">
                          {files.certificate ? "Change file" : "Upload file"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "certificate")}
                        />
                      </label>
                      
                      {files.certificate && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 font-semibold">
                            ✓ New file selected: {files.certificate.name}
                          </p>
                          {filePreviews.certificate && filePreviews.certificate !== "PDF_SELECTED" && (
                            <img
                              src={filePreviews.certificate}
                              alt="Certificate Preview"
                              className="mt-2 w-full h-32 object-cover rounded-lg border"
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : profile.certificateUrl ? (
                    isPdfFile(profile.certificateUrl) ? (
                      <button
                        onClick={() => openPdfInNewTab(profile.certificateUrl)}
                        className="flex items-center justify-center w-full h-32 border-2 border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="text-center">
                          <span className="text-4xl">📄</span>
                          <p className="text-sm text-gray-600 mt-2 font-semibold">View PDF Certificate</p>
                        </div>
                      </button>
                    ) : (
                      <img
                        src={profile.certificateUrl}
                        alt="Certificate"
                        className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition"
                        onClick={() => openImageViewer(profile.certificateUrl, "Certificate")}
                      />
                    )
                  ) : (
                    <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-400">No certificate uploaded</span>
                    </div>
                  )}
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Curriculum Vitae (Image or PDF)</label>
                  {isEditing ? (
                    <>
                      {/* Show existing file if no new file selected */}
                      {!files.cv && profile.cvUrl && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                          <p className="text-sm font-semibold text-yellow-800 mb-2">Current CV:</p>
                          {isPdfFile(profile.cvUrl) ? (
                            <button
                              onClick={() => openPdfInNewTab(profile.cvUrl)}
                              className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition text-sm"
                            >
                              <span className="text-xl">📄</span>
                              View Current PDF
                            </button>
                          ) : (
                            <img
                              src={profile.cvUrl}
                              alt="Current CV"
                              className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                              onClick={() => openImageViewer(profile.cvUrl, "Current CV")}
                            />
                          )}
                          <p className="text-xs text-gray-600 mt-2">Upload a new file to replace this</p>
                        </div>
                      )}

                      {/* Upload new file */}
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-yellow-400 border-dashed rounded-lg cursor-pointer bg-yellow-50 hover:bg-yellow-100">
                        <span className="text-4xl mb-2">📄</span>
                        <span className="text-sm text-yellow-600 font-semibold">
                          {files.cv ? "Change file" : "Upload file"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "cv")}
                        />
                      </label>
                      
                      {files.cv && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 font-semibold">
                            ✓ New file selected: {files.cv.name}
                          </p>
                          {filePreviews.cv && filePreviews.cv !== "PDF_SELECTED" && (
                            <img
                              src={filePreviews.cv}
                              alt="CV Preview"
                              className="mt-2 w-full h-32 object-cover rounded-lg border"
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : profile.cvUrl ? (
                    isPdfFile(profile.cvUrl) ? (
                      <button
                        onClick={() => openPdfInNewTab(profile.cvUrl)}
                        className="flex items-center justify-center w-full h-32 border-2 border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="text-center">
                          <span className="text-4xl">📄</span>
                          <p className="text-sm text-gray-600 mt-2 font-semibold">View PDF CV</p>
                        </div>
                      </button>
                    ) : (
                      <img
                        src={profile.cvUrl}
                        alt="CV"
                        className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition"
                        onClick={() => openImageViewer(profile.cvUrl, "Curriculum Vitae")}
                      />
                    )
                  ) : (
                    <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-400">No CV uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Links Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                    <span>🔗</span> Project Link
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="projectLink"
                      value={formData.projectLink}
                      onChange={handleInputChange}
                      placeholder="https://github.com/yourusername/project"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile.projectLink || ""}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-50"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                    <span>🔗</span> LinkedIn Link
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="linkedinLink"
                      value={formData.linkedinLink}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile.linkedinLink || ""}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-50"
                    />
                  )}
                </div>
              </div>

              {/* Delete Account Button (Only in Edit Mode) */}
              {isEditing && (
                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, password: "", loading: false })}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition font-semibold"
                  >
                    Delete Your Account
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Image Viewer Modal */}
      {imageViewer.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={closeImageViewer}>
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeImageViewer}
              className="absolute top-2 right-2 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition font-bold text-xl z-10"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 pr-12">{imageViewer.title}</h3>
            <img
              src={imageViewer.imageUrl}
              alt={imageViewer.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Account</h3>
            <p className="text-gray-700 mb-4">
              This action cannot be undone. Please enter your password to confirm account deletion.
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={deleteModal.password}
              onChange={(e) => setDeleteModal(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md mb-4"
              disabled={deleteModal.loading}
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteModal.loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-semibold disabled:opacity-50"
              >
                {deleteModal.loading ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => setDeleteModal({ isOpen: false, password: "", loading: false })}
                disabled={deleteModal.loading}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
