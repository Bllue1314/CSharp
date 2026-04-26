interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, ...props }: InputProps) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      {...props}
      className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${props.className ?? ''}`}
    />
    {error && <span className="text-red-500 text-xs">{error}</span>}
  </div>
);

export default Input;