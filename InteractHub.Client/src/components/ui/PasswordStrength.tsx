interface Props {
  password: string;
}

const PasswordStrength = ({ password }: Props) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)          score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const textColors = ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(level => (
          <div key={level}
            className={`h-1 flex-1 rounded-full transition-colors
              ${strength >= level ? colors[strength] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[strength]}`}>
        {labels[strength]}
      </p>
    </div>
  );
};

export default PasswordStrength;