import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  postId?: number;
}

export const useSignalR = (
  onNotification: (notification: Notification) => void
) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://interacthub-api.azurewebsites.net/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (notification: Notification) => {
      onNotification(notification);
    });

    connection.start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.warn('SignalR connection failed:', err));

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  return connectionRef.current;
};