import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold mb-4">City Budget Planner</h1>
    <p className="mb-6">Plan your expenses efficiently when moving to a new city.</p>
    <div>
      <Link to="/register" className="px-4 py-2 bg-blue-500 text-white rounded mr-4">Register</Link>
      <Link to="/login" className="px-4 py-2 bg-green-500 text-white rounded">Login</Link>
    </div>
  </div>
);

export default HomePage;
