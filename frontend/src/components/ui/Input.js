// src/components/ui/Input.js
import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, name, required=false }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      required={required}
      className="w-full px-4 py-3 text-white bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
};

export default Input;