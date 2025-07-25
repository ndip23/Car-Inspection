// src/components/ui/Card.js
import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-base-200 p-6 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;