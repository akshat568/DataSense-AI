import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({ icon, className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
