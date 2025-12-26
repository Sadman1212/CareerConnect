import React from "react";
import { useNavigate } from "react-router-dom";
import homeBg from "../images/home.jpg"; // background image

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      {/* Top navbar */}
      <header className="w-full bg-blue-900 text-white flex justify-between items-center px-10 py-4 shadow-md">
        <h1 className="text-2xl font-semibold">CareerConnect</h1>
        
        <div className="flex items-center gap-6">
          {/* Search box */}
          <div className="flex items-center bg-white rounded-full px-3 py-1">
            <span className="text-gray-500 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search companies..."
              onFocus={() => window.open('/search', '_blank')}
              className="bg-transparent outline-none text-sm text-gray-700 w-40 cursor-text"
            />
          </div>
          
          <nav className="space-x-6 text-sm">
            <button className="hover:text-gray-300">Contact Us</button>
            <button
              onClick={() => navigate("/about")}
              className="hover:text-gray-300"
            >
              About Us
            </button>
          </nav>
        </div>
      </header>

      <main
        className="flex-1 flex items-center justify-start px-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeBg})` }}
      >
        <div className="max-w-2xl w-full flex items-center bg-sky-100/80 rounded-xl p-8 ml-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-black-700">CareerConnect</span>
            </h2>
            <p className="text-gray-600 mb-8">
              A bridge between Companies and BRAC University Students.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register-user")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium"
              >
                Register as User
              </button>
              <button
                onClick={() => navigate("/register-company")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium"
              >
                Register as Company
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;












