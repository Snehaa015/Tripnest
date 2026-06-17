import React from 'react';

const LogoIcon = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Nest Bottom Twigs */}
      <path d="M3 13.5c2.5 4.5 15.5 4.5 18 0" stroke="currentColor" strokeWidth="2.2" />
      <path d="M5.5 15.5c2.5 3 10.5 3 13 0" stroke="currentColor" strokeWidth="1.8" opacity="0.85" />
      <path d="M4.2 11.2c3.5 2 12.1 2 15.6 0" stroke="currentColor" strokeWidth="1.8" opacity="0.65" />

      {/* Flight Path Dotted Trail */}
      <path d="M7.5 14c1.2-2.8 3.2-5.5 6.5-7.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2.5" opacity="0.75" />

      {/* Paper Airplane taking off */}
      <path d="M14 6.5l7-3.5-2.8 8-2.2-2.5-2-2z" fill="currentColor" />
      <path d="M18.2 11l-4.2-2.5 2.2 1.5 2 1z" fill="currentColor" opacity="0.75" />
    </svg>
  );
};

export default LogoIcon;
