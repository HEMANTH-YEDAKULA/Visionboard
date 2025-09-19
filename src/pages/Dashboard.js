import React, { useEffect, useState } from "react";
import axios from "axios";
import GoalCard from "../components/GoalCard";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [goals, setGoals] = useState([]);

  const fetchGoals = async () => {
    try {
      const res = await axios.get("http://localhost:8080/goals", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGoals(res.data);
    } catch (err) {
      alert("Failed to fetch goals: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/goals/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      alert("Failed to delete goal: " + err.message);
    }
  };

  const handleEdit = (goal) => {
    // Navigate to AddGoal page with state for editing
    // Will implement later
    alert("Edit functionality will be implemented.");
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.length === 0 ? (
            <p>No goals yet. Add one!</p>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
