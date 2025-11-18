import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "font-extrabold uppercase tracking-wider py-3 px-6 rounded-2xl transition-all transform active:scale-95 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:translate-y-0";
  
  const variants = {
    primary: "bg-primary text-white border-b-4 border-primaryDark hover:bg-green-400",
    secondary: "bg-secondary text-white border-b-4 border-secondaryDark hover:bg-cyan-400",
    danger: "bg-danger text-white border-b-4 border-dangerDark hover:bg-red-400",
    ghost: "bg-transparent text-subtle border-2 border-transparent hover:bg-slate-200",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  const baseStyle = "w-full bg-surface border-2 border-slate-200 text-ink text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors placeholder-slate-400";
  return (
    <input
      className={`${baseStyle} ${className}`}
      {...props}
    />
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};

export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg'; active?: boolean }> = ({ name, size = 'md', active = false }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-20 h-20 text-2xl'
  };

  const initials = name.slice(0, 2).toUpperCase();
  
  return (
    <div className={`rounded-full flex items-center justify-center font-black text-white relative transition-all ${sizes[size]} ${active ? 'ring-4 ring-secondary ring-offset-2 bg-secondary' : 'bg-slate-300'}`}>
      {initials}
      {active && (
        <span className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></span>
      )}
    </div>
  );
};