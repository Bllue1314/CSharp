// src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead } from '../services/notificationsService';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  postId?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [unreadCount, setUnreadCount]     = useState(0);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.isRead).length);
    } catch {
      console.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAll = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, isLoading, unreadCount, markRead, markAll };
};