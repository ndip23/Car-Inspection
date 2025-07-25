// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold text-secondary">404</h1>
      <p className="text-2xl mt-4">Page Not Found</p>
      <p className="text-text-secondary mt-2">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 px-6 py-2 bg-primary text-gray-800 rounded-lg hover:bg-green-600 transition">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;