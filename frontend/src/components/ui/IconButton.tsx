import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({ icon, className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`p-2 text-[#64736A] hover:text-[#26332D] hover:bg-[#F1F5EF] rounded-lg transition-colors duration-150 cursor-pointer ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
