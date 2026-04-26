import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useState } from 'react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

const RegisterPage = () => {
  const { login }         = useAuth();
  const navigate          = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>();
  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      const res = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName
      });
      login(res.data.token, res.data);
      navigate('/');
    } catch {
      setError('Registration failed. Email or username may already be taken.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-500 mb-6">
          InteractHub
        </h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Account</h2>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Display Name"
            placeholder="John Doe"
            error={errors.displayName?.message}
            {...register('displayName', { required: 'Display name is required' })}
          />
          <Input
            label="Username"
            placeholder="johndoe"
            error={errors.username?.message}
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Min 3 characters' },
              pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, underscores' }
            })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
            })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Min 8 characters' },
              pattern: {
                value: /^(?=.*[0-9])(?=.*[A-Z])/,
                message: 'Must contain uppercase and number'
              }
            })}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;