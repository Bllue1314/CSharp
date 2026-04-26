import api from './api';

export const getFriends = async () => {
  const response = await api.get('/friends');
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await api.get('/friends/requests');
  return response.data;
};

export const sendFriendRequest = async (userId: string) => {
  const response = await api.post(`/friends/${userId}`);
  return response.data;
};

export const acceptFriendRequest = async (friendshipId: number) => {
  const response = await api.put(`/friends/${friendshipId}/accept`);
  return response.data;
};

export const removeFriend = async (friendshipId: number) => {
  const response = await api.delete(`/friends/${friendshipId}`);
  return response.data;
};