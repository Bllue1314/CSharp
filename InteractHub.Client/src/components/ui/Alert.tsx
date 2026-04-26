interface Props {
  type: 'success' | 'error';
  message: string;
}

const Alert = ({ type, message }: Props) => {
  const styles = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error:   'bg-red-50 text-red-700 border border-red-200',
  };

  const icons = { success: '✅', error: '❌' };

  return (
    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;