interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const variants = {
  primary:   'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
};

const Button = ({ variant = 'primary', isLoading, children, disabled, ...props }: ButtonProps) => (
  <button
    {...props}
    disabled={disabled || isLoading}
    className={`px-4 py-2 rounded-lg font-medium transition-colors
      ${variants[variant]}
      ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      ${props.className ?? ''}`}
  >
    {isLoading ? 'Loading...' : children}
  </button>
);

export default Button;