import React from "react";

function GoalCard({ goal, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold">{goal.title}</h3>
      <p className="text-gray-600">{goal.description}</p>
      <div className="w-full bg-gray-200 rounded h-4 mt-2">
        <div
          className="bg-blue-600 h-4 rounded"
          style={{ width: `${goal.progress}%` }}
        ></div>
      </div>
      <div className="flex justify-end mt-2 gap-2">
        <button
          onClick={() => onEdit(goal)}
          className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default GoalCard;
