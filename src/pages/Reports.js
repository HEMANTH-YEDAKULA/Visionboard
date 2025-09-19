import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { week: "Week 1", progress: 40 },
  { week: "Week 2", progress: 60 },
  { week: "Week 3", progress: 75 },
  { week: "Week 4", progress: 90 },
];

function Reports() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="progress" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

export default Reports;
