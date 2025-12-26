import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const ApplyJobPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  
  // Get job details passed from UserDashboardPage
  const { companyName, companyId, jobTitle } = location.state || {};

  // Get user profile
  const storedProfile = localStorage.getItem("profile");
  const profile = storedProfile ? JSON.parse(storedProfile) : null;
  const avatarUrl = profile?.imageUrl || null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [cvImage, setCvImage] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [recommendationLetters, setRecommendationLetters] = useState([]);
  const [recommendationPreviews, setRecommendationPreviews] = useState([]);
  const [careerSummary, setCareerSummary] = useState([]);
  const [careerSummaryPreviews, setCareerSummaryPreviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullImageView, setFullImageView] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  // Handle CV upload (images and PDFs)
  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";
      
      if (!isImage && !isPDF) {
        setError("Please upload an image or PDF file for your CV");
        setCvImage(null);
        setCvPreview(null);
        return;
      }
      
      // MODIFIED: Set CV and clear any previous errors
      setCvImage(file);
      setError(""); // Clear error immediately when valid file is selected
      
      console.log("CV uploaded:", file.name, file.type); // Debug log
      
      // Only create preview for images
      if (isImage) {
        setCvPreview(URL.createObjectURL(file));
      } else {
        setCvPreview(null); // No preview for PDFs
      }
    }
  };

  // Handle recommendation letters upload (images and PDFs)
  const handleRecommendationUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const invalidFiles = files.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";
      return !isImage && !isPDF;
    });
    
    if (invalidFiles.length > 0) {
      setError("All recommendation letters must be images or PDF files");
      return;
    }
    
    setRecommendationLetters((prev) => [...prev, ...files]);
    
    const previews = files.map(file => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null; // No preview for PDFs
    });
    setRecommendationPreviews((prev) => [...prev, ...previews]);
    setError("");
  };

  // Handle career summary upload (images and PDFs)
  const handleCareerSummaryUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const invalidFiles = files.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";
      return !isImage && !isPDF;
    });
    
    if (invalidFiles.length > 0) {
      setError("All career summary files must be images or PDF files");
      return;
    }
    
    setCareerSummary((prev) => [...prev, ...files]);
    
    const previews = files.map(file => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null; // No preview for PDFs
    });
    setCareerSummaryPreviews((prev) => [...prev, ...previews]);
    setError("");
  };

  // Remove uploaded file
  const removeFile = (type, index) => {
    if (type === "recommendation") {
      setRecommendationLetters((prev) => prev.filter((_, i) => i !== index));
      setRecommendationPreviews((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "summary") {
      setCareerSummary((prev) => prev.filter((_, i) => i !== index));
      setCareerSummaryPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // MODIFIED: Handle form submission with IMPROVED validation
  const handleSubmit = async () => {
    // MODIFIED: More robust CV validation
    console.log("Submit clicked. CV file:", cvImage); // Debug log
    
    if (!cvImage) {
      console.log("No CV file detected!"); // Debug log
      setError("Sorry! without uploading your own Curriculum Vitae, you cannot apply for this company");
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show error
      return;
    }

    // Double check the CV file exists and is valid
    if (!(cvImage instanceof File)) {
      console.log("CV is not a valid file object!"); // Debug log
      setError("Please upload a valid CV file");
      return;
    }

    console.log("CV validation passed! Proceeding with submission..."); // Debug log
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("companyId", companyId);
      formData.append("companyName", companyName);
      formData.append("jobTitle", jobTitle);
      formData.append("cvImage", cvImage);

      // Log what we're sending
      console.log("Sending application with CV:", cvImage.name);

      // Add recommendation letters (OPTIONAL)
      recommendationLetters.forEach((file) => {
        formData.append("recommendationLetters", file);
      });

      // Add career summary (OPTIONAL)
      careerSummary.forEach((file) => {
        formData.append("careerSummary", file);
      });

      const token = localStorage.getItem("token");
      
      await axios.post(`${API_BASE_URL}/applications/apply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Application submitted successfully!"); // Debug log
      
      // Navigate to applied jobs page
      navigate("/applied-jobs");
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(
        err.response?.data?.error || "Failed to submit application. Please try again."
      );
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* MODIFIED: Full Image View Modal - MUCH LARGER */}
      {fullImageView && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setFullImageView(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setFullImageView(null)}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md font-bold text-lg z-10 shadow-lg"
            >
              ✕ Close
            </button>
            <img
              src={fullImageView}
              alt="Full View"
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

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

      <div className="flex flex-1">
        {/* Left sidebar */}
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
            <button
              className="text-left px-4 py-2 hover:bg-slate-800"
              onClick={() => navigate("/user-profile")}
            >
              Profile
            </button>
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 bg-gradient-to-b from-gray-100 to-gray-300 py-8 px-4 md:px-8">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-pink-700">
                Apply Easily For Your Job!!
              </h1>
              <button
                onClick={() => navigate("/user-dashboard")}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-semibold"
              >
                Cancel
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* CV Upload Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Drop Your CV Please: <span className="text-red-600">*</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload as Photo or PDF */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    (upload your file as photo or PDF)
                  </p>
                  <label className="flex flex-col items-center justify-center bg-gray-200 hover:bg-gray-300 border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer transition">
                    <svg
                      className="w-12 h-12 text-gray-600 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">
                      Add CV (Image or PDF)
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleCvUpload}
                      className="hidden"
                    />
                  </label>
                  {cvImage && (
                    <p className="mt-2 text-sm text-green-600 font-semibold">
                      ✓ {cvImage.name}
                    </p>
                  )}
                </div>

                {/* CV Preview */}
                {cvPreview && (
                  <div className="border-2 border-gray-300 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      CV Preview:
                    </p>
                    <img
                      src={cvPreview}
                      alt="CV Preview"
                      className="w-full h-48 object-contain cursor-pointer hover:opacity-80 transition"
                      onClick={() => setFullImageView(cvPreview)}
                    />
                    <p className="text-xs text-blue-600 text-center mt-2 font-semibold">
                      👆 Click to view full size
                    </p>
                  </div>
                )}
                
                {/* Show PDF name if PDF is selected */}
                {cvImage && !cvPreview && (
                  <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-6xl">📄</span>
                      <p className="text-sm font-semibold text-gray-700 mt-2">
                        {cvImage.name}
                      </p>
                      <p className="text-xs text-gray-500">PDF File</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Other Necessary Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Other necessary information: <span className="text-gray-500 text-sm">(Optional)</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Recommendation Letters */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Recommendation Letters (Image or PDF)
                  </h3>
                  <label className="flex items-center justify-center bg-green-400 hover:bg-green-500 text-white rounded-lg px-4 py-3 cursor-pointer transition font-semibold">
                    <span className="mr-2">Add file</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleRecommendationUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Display uploaded files */}
                  {recommendationLetters.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {recommendationLetters.map((file, index) => (
                        <div key={index} className="bg-gray-100 rounded p-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {file.name} {file.type === "application/pdf" && "📄"}
                            </span>
                            <button
                              onClick={() => removeFile("recommendation", index)}
                              className="text-red-500 hover:text-red-700 font-bold ml-2"
                            >
                              ✕
                            </button>
                          </div>
                          {recommendationPreviews[index] && (
                            <>
                              <img
                                src={recommendationPreviews[index]}
                                alt={`Recommendation ${index + 1}`}
                                className="w-full h-32 object-contain cursor-pointer hover:opacity-80 transition"
                                onClick={() => setFullImageView(recommendationPreviews[index])}
                              />
                              <p className="text-xs text-blue-600 text-center mt-1">
                                👆 Click to view full size
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Career Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Career Summary (Image or PDF)
                  </h3>
                  <label className="flex items-center justify-center bg-green-400 hover:bg-green-500 text-white rounded-lg px-4 py-3 cursor-pointer transition font-semibold">
                    <span className="mr-2">Add file</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleCareerSummaryUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Display uploaded files */}
                  {careerSummary.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {careerSummary.map((file, index) => (
                        <div key={index} className="bg-gray-100 rounded p-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {file.name} {file.type === "application/pdf" && "📄"}
                            </span>
                            <button
                              onClick={() => removeFile("summary", index)}
                              className="text-red-500 hover:text-red-700 font-bold ml-2"
                            >
                              ✕
                            </button>
                          </div>
                          {careerSummaryPreviews[index] && (
                            <>
                              <img
                                src={careerSummaryPreviews[index]}
                                alt={`Career Summary ${index + 1}`}
                                className="w-full h-32 object-contain cursor-pointer hover:opacity-80 transition"
                                onClick={() => setFullImageView(careerSummaryPreviews[index])}
                              />
                              <p className="text-xs text-blue-600 text-center mt-1">
                                👆 Click to view full size
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-yellow-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-gray-900 font-bold px-12 py-3 rounded-lg text-lg transition`}
              >
                {loading ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplyJobPage;
