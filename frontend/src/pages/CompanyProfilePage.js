// frontend/src/pages/CompanyProfilePage.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import TopBar from "../components/TopBar";


const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();


  // -----------------------------
  // 💡 AUTO-FIX COMPANY NAME HERE
  // -----------------------------
  const normalizeProfile = (data) => {
    if (!data) return {};


    return {
      id: data.id || data._id || null,
      role: data.role || data.userRole || data.roleType || null,
      email: data.email || data.contactEmail || "",
      companyName: data.companyName || data.name || data.company?.name || "",
      email: data.email || "",
      contactNo: data.contactNo || "",
      establishmentYear: data.establishmentYear || "",
      industryType: data.industryType || "",
      address: data.address || "",
      licenseNo: data.licenseNo || "",
      imageUrl: data.imageUrl || "",
      website: data.website || "",
      companySize: data.companySize || "",
      companyType: data.companyType || "",
      about: data.about || "",
      facebook: data.facebook || "",
      linkedin: data.linkedin || "",
      tagline: data.tagline || "",
      hrName: data.hrName || "",
      hrEmail: data.hrEmail || "",
      hrPhone: data.hrPhone || "",
    };
  };

  const storedProfile = localStorage.getItem("profile");
  const defaultProfile = storedProfile
    ? normalizeProfile(JSON.parse(storedProfile))
    : normalizeProfile({});

  const [profile, setProfile] = useState(defaultProfile);
  const [tempProfile, setTempProfile] = useState(defaultProfile);
  const [jobs, setJobs] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    loading: false
  });


  const fileInputRefSidebar = useRef(null);
  const fileInputRefMain = useRef(null);


  const avatarUrl = profile?.imageUrl || null;


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    navigate("/");
  };

  // load company by id param or fallback to stored profile
  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          const res = await fetch(`${API_BASE_URL}/company/${id}`);
          if (!res.ok) throw new Error("Company fetch failed");
          const data = await res.json();
          const norm = normalizeProfile(data);
          setProfile(norm);
          setTempProfile(norm);

          // fetch jobs for this company
          try {
            const jobsRes = await fetch(`${API_BASE_URL}/jobs?companyId=${encodeURIComponent(id)}`);
            const jobsData = await jobsRes.json();
            setJobs(Array.isArray(jobsData) ? jobsData : []);
          } catch (e) {
            console.error("Jobs fetch failed", e);
            setJobs([]);
          }

          // determine ownership more reliably by asking the server for logged-in company
          try {
            const token = localStorage.getItem("token");
            if (token) {
              const meRes = await fetch(`${API_BASE_URL}/company/me`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (meRes.ok) {
                const meData = await meRes.json();
                const myId = meData._id || meData.id;
                setIsOwner(Boolean(myId && (myId === id || myId === data._id)));
              } else {
                // fallback to local stored profile
                const stored = JSON.parse(localStorage.getItem("profile") || "{}");
                const storedId = stored.id || stored._id || null;
                setIsOwner(Boolean(storedId && (storedId === id || storedId === data._id)));
              }
            } else {
              const stored = JSON.parse(localStorage.getItem("profile") || "{}");
              const storedId = stored.id || stored._id || null;
              setIsOwner(Boolean(storedId && (storedId === id || storedId === data._id)));
            }
          } catch (e) {
            const stored = JSON.parse(localStorage.getItem("profile") || "{}");
            const storedId = stored.id || stored._id || null;
            setIsOwner(Boolean(storedId && (storedId === id || storedId === data._id)));
          }
        } else {
          const stored = localStorage.getItem("profile");
          const s = stored ? JSON.parse(stored) : {};
          const norm = normalizeProfile(s);
          setProfile(norm);
          setTempProfile(norm);
          const storedId = s.id || s._id || null;
          // If viewing own profile (no id in route), user is owner when stored profile role is company
          setIsOwner(Boolean(storedId && s.role === "company"));

          if (storedId) {
            try {
              const jobsRes = await fetch(`${API_BASE_URL}/jobs?companyId=${encodeURIComponent(storedId)}`);
              const jobsData = await jobsRes.json();
              setJobs(Array.isArray(jobsData) ? jobsData : []);
            } catch (e) {
              setJobs([]);
            }
          }
        }
      } catch (err) {
        console.error("Load company error", err);
      }
    };

    load();
  }, [id]);

  const handleChange = (e) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
  };


  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Not authenticated");


      const stored = JSON.parse(localStorage.getItem("profile") || "{}");
      let companyId = stored.id || stored._id || profile.id;
      if (!companyId) return alert("Company id not found. Please re-login.");


      const res = await fetch(`${API_BASE_URL}/company/${companyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tempProfile),
      });


      const data = await res.json();
      if (!res.ok) {
        console.error("Save failed", data);
        return alert(data.message || "Failed to save profile");
      }


      const newProfile = {
        id: data._id || data.id || companyId,
        role: "company",
        companyName: data.companyName,
        email: data.email,
        contactNo: data.contactNo,
        establishmentYear: data.establishmentYear,
        industryType: data.industryType,
        address: data.address,
        licenseNo: data.licenseNo,
        imageUrl: data.imageUrl,
        website: data.website,
        companySize: data.companySize,
        companyType: data.companyType,
        about: data.about,
        facebook: data.facebook,
        linkedin: data.linkedin,
        tagline: data.tagline,
        hrName: data.hrName,
        hrEmail: data.hrEmail,
        hrPhone: data.hrPhone,
      };


      setProfile({ ...profile, ...tempProfile });
      setTempProfile({ ...tempProfile });
      localStorage.setItem("profile", JSON.stringify(newProfile));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Server error while saving profile");
    }
  };


  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };


  const handleDelete = () => {
    setDeleteModal({ isOpen: true, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteModal({ isOpen: true, loading: true });
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/company/delete-profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete company");
      }

      // Clear local storage and redirect to home page
      localStorage.removeItem("profile");
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting company profile");
      setDeleteModal({ isOpen: false, loading: false });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, loading: false });
  };


  const handleFileSelected = (file) => {
    if (!file) return;


    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please select a PNG/JPG/WebP image.");
      return;
    }

  // If user is owner and authenticated, upload via backend endpoint
    const token = localStorage.getItem("token");
    if (isOwner && token) {
      (async () => {
        try {
          const fd = new FormData();
          fd.append("image", file);

          const res = await fetch(`${API_BASE_URL}/company/upload-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });

          const data = await res.json();
          if (!res.ok) {
            console.error("Upload failed", data);
            return alert(data.message || "Image upload failed");
          }

          // Server returns updated company
          const updatedCompany = data;
          const norm = normalizeProfile(updatedCompany);
          setProfile(norm);
          setTempProfile(norm);

          // update stored profile if it's the logged-in company
          const stored = JSON.parse(localStorage.getItem("profile") || "{}");
          const storedId = stored.id || stored._id || null;
          const updatedStore = { ...stored };
          if (storedId && (storedId === updatedCompany._id || storedId === updatedCompany.id)) {
            updatedStore.imageUrl = updatedCompany.imageUrl;
            updatedStore.companyName = updatedCompany.companyName || updatedStore.companyName;
            updatedStore.id = updatedCompany._id || updatedCompany.id || updatedStore.id;
            localStorage.setItem("profile", JSON.stringify(updatedStore));
          }
        } catch (err) {
          console.error(err);
          alert("Failed to upload image");
        }
      })();
      return;
    }

    // Fallback: create local preview (read-only viewers)
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const updated = { ...profile, imageUrl: dataUrl };
      const updatedTemp = { ...tempProfile, imageUrl: dataUrl };
      setProfile(updated);
      setTempProfile(updatedTemp);
      localStorage.setItem("profile", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };


  const triggerSidebarFile = () => fileInputRefSidebar.current?.click();
  const triggerMainFile = () => fileInputRefMain.current?.click();

  const handleDeleteImage = async () => {
    const token = localStorage.getItem("token");
    const stored = JSON.parse(localStorage.getItem("profile") || "{}");
    const companyId = id || stored.id || stored._id || profile.id;

    if (isOwner && token) {
      try {
        const res = await fetch(`${API_BASE_URL}/company/${companyId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageUrl: "" }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Delete image failed", data);
          return alert(data.message || "Failed to delete image");
        }
        const norm = normalizeProfile(data);
        setProfile(norm);
        setTempProfile(norm);
        if (stored.id && (stored.id === data._id || stored.id === data.id)) {
          stored.imageUrl = "";
          localStorage.setItem("profile", JSON.stringify(stored));
        }
        return;
      } catch (err) {
        console.error(err);
        alert("Failed to delete image");
        return;
      }
    }

    const updated = { ...profile, imageUrl: "" };
    const updatedTemp = { ...tempProfile, imageUrl: "" };
    setProfile(updated);
    setTempProfile(updatedTemp);
    localStorage.setItem("profile", JSON.stringify(updated));
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <TopBar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900 text-white pt-6">
          <div className="flex flex-col items-center mb-6">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Company" className="w-16 h-16 rounded-md object-cover bg-slate-700" />
            ) : (
              <div className="w-16 h-16 rounded-md bg-slate-700" />
            )}

            {isOwner && (
              <div className="flex gap-2 mt-2">
                <button onClick={triggerSidebarFile} className="bg-white px-2 py-1 rounded shadow-md text-xs">📷</button>
                <button onClick={handleDeleteImage} className="bg-red-600 px-2 py-1 rounded shadow-md text-white text-xs">🗑️</button>
              </div>
            )}


            <input
              ref={fileInputRefSidebar}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                handleFileSelected(f);
                e.target.value = null;
              }}
            />


            <span className="text-xs text-gray-300 mt-2">
              {profile.companyName || "Company"}
            </span>
          </div>


          <nav className="flex flex-col text-sm">
            <button 
              className="px-4 py-2 text-left hover:bg-slate-800" 
              onClick={() => navigate("/company-dashboard")}
            >
              Dashboard
            </button>


            <button 
              className="px-4 py-2 text-left hover:bg-slate-800"
              onClick={() => navigate("/company/posted-jobs")}
            >
              Posted Jobs
            </button>


            <button 
              className="px-4 py-2 text-left hover:bg-slate-800"
              onClick={() => navigate("/company/candidates")}
            >
              Candidate list
            </button>




            <button className="px-4 py-2 text-left hover:bg-slate-800"
            onClick={() => navigate("/company-query-forum")}
            >
              Query Forum
            </button>


            <button className="px-4 py-2 text-left bg-indigo-600">
              Profile
            </button>


            <button
              className="px-4 py-2 text-left hover:bg-slate-800"
              onClick={() => navigate("/company/posted-career-events")}
            >
              Posted CareerEvents
            </button>
          </nav>
        </aside>


        {/* Main content */}
        <main className="flex-1 bg-gradient-to-b from-gray-100 to-gray-300 p-6 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-8">
            <h2 className="text-lg font-semibold mb-6">Company Information</h2>


            <div className="flex flex-col items-center mb-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Company" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-700" />
              )}

              {isOwner && (
                <div className="flex gap-2 mt-2">
                  <button onClick={triggerMainFile} className="bg-white px-3 py-1 rounded shadow-md text-sm">📷</button>
                  <button onClick={handleDeleteImage} className="bg-red-600 px-3 py-1 rounded shadow-md text-white text-sm">🗑️</button>
                </div>
              )}


              <input
                ref={fileInputRefMain}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  handleFileSelected(f);
                  e.target.value = null;
                }}
              />
            </div>


            {/* Profile Fields */}
            <div className="border rounded-md overflow-hidden text-sm">
              {[
                ["Company Name", "companyName"],
                ["Email", "email"],
                ["Phone", "contactNo"],
                ["Establishment Year", "establishmentYear"],
                ["Industry", "industryType"],
                ["Address", "address"],
                ["License No", "licenseNo"],
              ].map(([label, key]) => (
                <div key={key} className="flex border-b px-4 py-2">
                  <span className="w-44 font-medium">{label}:</span>
                  {!isEditing ? (
                    <span>{profile[key]}</span>
                  ) : (
                    <input
                      name={key}
                      value={tempProfile[key]}
                      onChange={handleChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  )}
                </div>
              ))}
            </div>


            {/* Additional Info */}
            <h3 className="mt-4 mb-2 font-semibold text-gray-700">Additional Information</h3>
            <div className="border rounded-md overflow-hidden text-sm max-h-64 overflow-y-auto">
              {[
                ["Website", "website"],
                ["Company Size", "companySize"],
                ["Company Type", "companyType"],
                ["About Company", "about"],
                ["Facebook Page", "facebook"],
                ["LinkedIn Page", "linkedin"],
                ["Tagline", "tagline"],
                ["HR Name", "hrName"],
                ["HR Email", "hrEmail"],
                ["HR Phone", "hrPhone"],
              ].map(([label, key]) => (
                <div key={key} className="flex border-b px-4 py-2">
                  <span className="w-44 font-medium">{label}:</span>
                  {!isEditing ? (
                    <span>{profile[key]}</span>
                  ) : (
                    <input
                      name={key}
                      value={tempProfile[key]}
                      onChange={handleChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Jobs List */}
            <h3 className="mt-6 mb-4 font-semibold text-gray-700 text-lg">Open Positions ({jobs.length})</h3>
            <div className="space-y-3">
              {jobs.length === 0 && (
                <div className="px-4 py-4 text-sm text-gray-500 bg-gray-50 rounded border border-gray-200">No open jobs at this moment.</div>
              )}
              {jobs.map((job) => (
                <div key={job._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                  <div 
                    onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                    className="px-4 py-4 bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-base">{job.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Category: {job.category} | Department: {job.department} | 
                        Deadline: {new Date(job.deadline || job.createdAt || "").toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-gray-400">{expandedJob === job._id ? '▼' : '▶'}</div>
                  </div>

                  {expandedJob === job._id && (
                    <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-3 text-sm">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                        <p className="text-gray-600">{job.description || "No description provided"}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Requirements</h4>
                        <p className="text-gray-600">{job.requirements || "No requirements specified"}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Benefits</h4>
                        <p className="text-gray-600">{job.benefits || "No benefits listed"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-1">Experience</h4>
                          <p className="text-gray-600">{job.experience || "Not specified"}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-1">Salary</h4>
                          <p className="text-gray-600">{job.salaryRange || "Not disclosed"}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Location</h4>
                        <p className="text-gray-600">{job.address || "Not specified"}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/apply-job/${job._id}`, { state: { companyName: profile.companyName, companyId: profile.id || profile._id, jobTitle: job.title } })} 
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium mt-2"
                      >
                        Apply Now
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6 flex-wrap">
              {!isEditing && isOwner && (
                <>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={handleDelete}
                  >
                    Delete Profile
                  </button>
                </>
              )}

              {isEditing && isOwner && (
                <>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={handleSave}
                  >
                    Save
                  </button>

                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-xl font-bold text-red-600 mb-4">Delete Company Profile</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete your company profile? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  disabled={deleteModal.loading}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteModal.loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteModal.loading ? "Deleting..." : "Delete Profile"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default CompanyProfilePage;
