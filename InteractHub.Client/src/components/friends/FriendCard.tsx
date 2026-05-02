import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { sendFriendRequest, getFriends, getPendingRequests } from '../../services/friendsService';

interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

interface Props {
  user: FriendUser;
  showAddButton?: boolean;
}

const FriendCard = ({ user, showAddButton = false }: Props) => {
  const { user: currentUser }     = useAuth();
  const navigate                  = useNavigate();
  const [status, setStatus]       = useState<'none' | 'friends' | 'pending' | 'self'>('none');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!showAddButton) { setIsLoading(false); return; }

    if (currentUser?.userId === user.id) {
      setStatus('self');
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          getFriends(),
          getPendingRequests()
        ]);

        const isFriend  = friendsRes.data.some((f: FriendUser) => f.username === user.username);
        const isPending = requestsRes.data.some((f: FriendUser) => f.username === user.username);

        if (isFriend)       setStatus('friends');
        else if (isPending) setStatus('pending');
        else                setStatus('none');
      } catch {
        setStatus('none');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user.id]);

  const handleAdd = async () => {
    try {
      await sendFriendRequest(user.id);
      setStatus('pending');
    } catch {
      console.error('Failed to send request');
    }
  };

  const renderButton = () => {
    if (!showAddButton || status === 'self') return null;
    if (isLoading) return <Button variant="secondary" disabled>...</Button>;

    switch (status) {
      case 'friends':
        return <Button variant="secondary" disabled>Friends ✓</Button>;
      case 'pending':
        return <Button variant="secondary" disabled>Requested</Button>;
      default:
        return <Button onClick={handleAdd}>Add Friend</Button>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer flex-1"
        onClick={() => navigate(`/profile/${user.id}`)}>
        <Avatar src={user.avatarUrl} username={user.username} />
        <div>
          <p className="font-semibold text-gray-800 hover:text-blue-500">
            {user.displayName}
          </p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>
      {renderButton()}
    </div>
  );
};

export default FriendCard;