import React from 'react';

interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
}

const DarkCard: React.FC<DarkCardProps> = ({ children, className = '' }) => (
  <div className={`bg-gray-900/90 rounded-2xl p-10 shadow-2xl text-gray-100 ${className}`}>
    {children}
  </div>
);

export default DarkCard;
