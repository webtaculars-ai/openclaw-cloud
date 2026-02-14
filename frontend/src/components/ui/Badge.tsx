import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    default: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span className={`badge ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
