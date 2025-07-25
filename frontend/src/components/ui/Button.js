// src/components/ui/Button.js
import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
  const baseStyle = "w-full flex justify-center items-center space-x-2 font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50";
  
  const variants = {
    primary: 'bg-primary hover:bg-green-600 text-gray-800',
    secondary: 'bg-secondary hover:bg-orange-600 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;