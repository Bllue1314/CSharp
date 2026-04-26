import api from './api';

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  displayName: string;
}) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};