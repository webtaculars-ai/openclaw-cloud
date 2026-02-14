import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', hover = false, className = '', ...props }, ref) => {
    const baseStyles = 'card';
    
    const variantStyles = {
      default: '',
      elevated: 'shadow-xl',
      glass: 'card-glass',
    };
    
    const hoverStyles = hover ? 'card-hover' : '';
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
