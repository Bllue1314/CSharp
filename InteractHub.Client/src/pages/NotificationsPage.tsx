import { useEffect, useState } from 'react';
import { getNotifications, markAllAsRead } from '../services/notificationsService';
import NotificationItem from '../components/notifications/NotificationItem';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  postId?: number;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
      } catch {
        console.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleReadAll = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <Button variant="secondary" onClick={handleReadAll}>
            Mark all as read
          </Button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {notifications.length === 0
          ? <p className="text-center text-gray-500 p-8">No notifications</p>
          : notifications.map(n => (
            <NotificationItem key={n.id} notification={n} onRead={handleRead} />
          ))}
      </div>
    </div>
  );
};

export default NotificationsPage;