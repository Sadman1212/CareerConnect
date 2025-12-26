// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserRegisterPage from "./pages/UserRegisterPage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import CompanyDashboardPage from "./pages/CompanyDashboardPage";
import UserProfilePage from "./pages/UserProfilePage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AboutPage from "./pages/AboutPage";

// Job & Application pages
import AddJobPage from "./pages/AddJobPage";
import EditJobPage from "./pages/EditJobPage";
import PostedJobsPage from "./pages/PostedJobsPage";
import ApplyJobPage from "./pages/ApplyJobPage";
import AppliedJobsPage from "./pages/AppliedJobsPage";
import CompanyCandidatesPage from "./pages/CompanyCandidatesPage";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import FollowedJobsPage from "./pages/FollowedJobsPage";

// Career events pages (Company side)
import AddCareerEventPage from "./pages/AddCareerEventPage";
import PostedCareerEventsPage from "./pages/PostedCareerEventsPage";

// Career events pages (User side)
import ViewCareerEventsPage from "./pages/ViewCareerEventsPage";
import RegisterEventPage from "./pages/RegisterEventPage";
import VerifyEventRegistrationPage from "./pages/VerifyEventRegistrationPage";
import RegisteredEventsPage from "./pages/RegisteredEventsPage"; // ✅ NEW

// Admin pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import SearchPage from "./pages/SearchPage";
import CompanySearchPage from "./pages/CompanySearchPage";

// Query Forum page
// Query Forum page
import QueryForumPage from "./pages/QueryForumPage";
import CompanyQueryForumPage from "./pages/CompanyQueryForumPage";



function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-user" element={<UserRegisterPage />} />
          <Route path="/register-company" element={<CompanyRegisterPage />} />
          <Route path="/user-dashboard" element={<UserDashboardPage />} />
          <Route path="/company-dashboard" element={<CompanyDashboardPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/user-profile/:userId" element={<UserProfilePage />} />
          <Route path="/company-profile" element={<CompanyProfilePage />} />
          <Route path="/company/:id" element={<CompanyProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/company-search" element={<CompanySearchPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Company application/job routes */}
          <Route path="/company/candidates" element={<CompanyCandidatesPage />} />
          <Route
            path="/company/jobs/:jobId/applicants"
            element={<JobApplicantsPage />}
          />
          <Route path="/company/jobs/new" element={<AddJobPage />} />
          <Route path="/apply-job/:jobId" element={<ApplyJobPage />} />
          <Route path="/applied-jobs" element={<AppliedJobsPage />} />
          <Route path="/followed-jobs" element={<FollowedJobsPage />} />
          <Route path="/company/jobs/:id/edit" element={<EditJobPage />} />
          <Route path="/company/posted-jobs" element={<PostedJobsPage />} />
          {/* Query forum */}
          <Route path="/query-forum" element={<QueryForumPage />} />
          <Route path="/company-query-forum" element={<CompanyQueryForumPage />} />

          {/* Company career-events routes */}
          <Route
            path="/company/career-events/new"
            element={<AddCareerEventPage />}
          />
          <Route
            path="/company/career-events/:id/edit"
            element={<AddCareerEventPage />}
          />
          <Route
            path="/company/posted-career-events"
            element={<PostedCareerEventsPage />}
          />

          {/* User career-events routes */}
          <Route
            path="/view-career-events"
            element={<ViewCareerEventsPage />}
          />
          <Route
            path="/register-event/:eventId"
            element={<RegisterEventPage />}
          />
          <Route
            path="/verify-event-registration"
            element={<VerifyEventRegistrationPage />}
          />
          {/* ✅ NEW: Registered Events route */}
          <Route
            path="/registered-events"
            element={<RegisteredEventsPage />}
          />

          {/* Admin routes */}
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin-panel" element={<AdminPanelPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
