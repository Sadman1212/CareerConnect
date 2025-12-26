// src/pages/AboutPage.js
import React from "react";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      <header className="w-full bg-blue-900 text-white flex justify-between items-center px-10 py-4 shadow-md">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-indigo-500 hover:bg-blue-600 text-white text-xs px-4 py-1 rounded-full shadow"
        >
          Back
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            About CareerConnect
          </h2>
          <p className="text-gray-700 mb-3 text-sm leading-relaxed">
            CareerConnect is a platform designed to connect BRAC University Undergraduate and Postgraduate
            students with companies for internships, part-time roles and
            full-time opportunities.
          </p>
          <p className="text-gray-700 mb-3 text-sm leading-relaxed">
            Students can build profiles, explore curated job posts and interact
            with employers, while companies can efficiently reach relevant
            talent from BRAC University.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            The goal of CareerConnect is to act as a dedicated bridge between
            academia and industry, making the transition from campus to career
            smoother for BRAC University students.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
