import React, { useState} from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function AddGoal() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we came here for editing
  const editingGoal = location.state?.goal || null;

  const [title, setTitle] = useState(editingGoal?.title || "");
  const [description, setDescription] = useState(editingGoal?.description || "");
  const [category, setCategory] = useState(editingGoal?.category || "Health");
  const [target, setTarget] = useState(editingGoal?.target || "");
  const [deadline, setDeadline] = useState(editingGoal?.deadline || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingGoal) {
        // Update existing goal
        await axios.put(
          `http://localhost:8080/goals/${editingGoal.id}`,
          { title, description, category, target, deadline },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Goal updated!");
      } else {
        // Create new goal
        await axios.post(
          "http://localhost:8080/goals",
          { title, description, category, target, deadline },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Goal added!");
      }
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to save goal: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {editingGoal ? "Edit Goal" : "Add Goal"}
        </h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        >
          <option>Health</option>
          <option>Career</option>
          <option>Finance</option>
          <option>Education</option>
        </select>
        <input
          type="number"
          placeholder="Target Value"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          {editingGoal ? "Update Goal" : "Add Goal"}
        </button>
      </form>
    </div>
  );
}

export default AddGoal;
