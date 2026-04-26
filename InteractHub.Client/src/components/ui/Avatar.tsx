interface AvatarProps {
  src?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-16 w-16 text-xl'
};

const Avatar = ({ src, username = 'U', size = 'md' }: AvatarProps) => {
  if (src) return (
    <img src={src} alt={username}
      className={`${sizes[size]} rounded-full object-cover`} />
  );

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-500 flex items-center justify-center text-white font-bold`}>
      {username?.[0]?.toUpperCase() ?? 'U'}
    </div>
  );
};

export default Avatar;