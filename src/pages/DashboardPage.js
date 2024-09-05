import React, { useState } from "react";
import axios from "axios";

const DashboardPage = () => {
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetPlan, setBudgetPlan] = useState("");
  const [message, setMessage] = useState('');

  const generateBudget = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    console.log("userinfo", userInfo.token) ;
  
    if (!userInfo || !userInfo.token) {
      setMessage('User not authenticated');
      return;
    }
  
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,  // Use token from localStorage
        "Content-Type": "application/json",
      },
    };
  
    try {
      const { data } = await axios.post("/api/budget/generate", { city, budget }, config);
      setBudgetPlan(data.budgetPlan);
      setMessage('');  
    } catch (error) {
      console.error("Error generating budget plan:", error);
      setMessage('Failed to generate budget plan'); 
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Generate Budget Plan</h2>
      {message && <p className="text-red-500 mb-4">{message}</p>} 
      <div className="mb-4">
        <input
          type="text"
          placeholder="City Name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full mb-2"
        />
        <input
          type="number"
          placeholder="Total Budget ($)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>
      <button
        onClick={generateBudget}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Generate
      </button>
      {budgetPlan && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Budget Plan:</h3>
          <pre className="whitespace-pre-wrap">{budgetPlan}</pre>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
