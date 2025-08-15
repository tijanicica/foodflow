import React from 'react';

export const ProfileSection = ({ title, children }) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
        {title}
      </h2>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
};