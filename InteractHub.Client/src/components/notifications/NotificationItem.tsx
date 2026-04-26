import { markAsRead } from '../../services/notificationsService';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  postId?: number;
}

interface Props {
  notification: Notification;
  onRead: (id: number) => void;
}

const NotificationItem = ({ notification, onRead }: Props) => {
  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      onRead(notification.id);
    }
  };

  return (
    <div onClick={handleClick}
      className={`p-4 rounded-lg cursor-pointer transition-colors
        ${notification.isRead ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'}`}>
      <p className="text-sm text-gray-800">{notification.message}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(notification.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default NotificationItem;