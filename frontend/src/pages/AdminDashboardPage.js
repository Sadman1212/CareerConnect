import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  return (
    <AdminLayout profile={profile}>
      <div className="w-full mt-6 px-6">
        <div className="bg-white shadow-lg rounded-md p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">Welcome to Admin Dashboard</h2>
            <p className="text-sm text-gray-600">
              Monitor platform activity and manage users & companies.
            </p>
          </div>

          <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow">
            Quick Action
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
