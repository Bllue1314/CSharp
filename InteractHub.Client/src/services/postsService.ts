import api from './api';

export const getFeed = async (page = 1, pageSize = 10) => {
  const response = await api.get(`/posts?page=${page}&pageSize=${pageSize}`);
  return response.data;
};

export const getPostById = async (id: number) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (content: string, image?: File) => {
  const formData = new FormData();
  formData.append('content', content);
  if (image) formData.append('image', image);
  const response = await api.post('/posts', formData);
  return response.data;
};

export const deletePost = async (id: number) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export const toggleLike = async (id: number) => {
  const response = await api.post(`/posts/${id}/like`);
  return response.data;
};

export const getComments = async (postId: number) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const addComment = async (postId: number, content: string) => {
  const response = await api.post(`/posts/${postId}/comments`, { content });
  return response.data;
};