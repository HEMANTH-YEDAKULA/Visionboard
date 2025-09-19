import React from "react";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">VisionBoard</h2>
      <button
        className="mb-3 text-left p-2 rounded hover:bg-blue-100"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>
      <button
        className="mb-3 text-left p-2 rounded hover:bg-blue-100"
        onClick={() => navigate("/add-goal")}
      >
        Add Goal
      </button>
      <button
        className="mb-3 text-left p-2 rounded hover:bg-blue-100"
        onClick={() => navigate("/reports")}
      >
        Reports
      </button>
      <button
        className="mt-auto text-left p-2 rounded hover:bg-red-100 text-red-600"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
