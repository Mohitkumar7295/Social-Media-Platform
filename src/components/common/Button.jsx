import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-brand-700 hover:bg-brand-800 text-white shadow-sm hover:shadow focus:ring-brand-700 active:scale-[0.98]',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800 focus:ring-stone-400 active:scale-[0.98]',
    outline: 'border border-stone-300 hover:border-stone-400 bg-transparent text-stone-800 hover:bg-stone-50 focus:ring-stone-400',
    ghost: 'bg-transparent hover:bg-stone-100 text-stone-700 hover:text-stone-900 focus:ring-stone-300',
    white: 'bg-white hover:bg-stone-50 text-stone-900 shadow-sm hover:shadow focus:ring-white active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-full gap-1.5',
    md: 'text-sm px-4 py-2 rounded-full gap-2',
    lg: 'text-base px-6 py-3 rounded-full gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
    </button>
  );
}
