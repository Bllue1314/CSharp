import { useState } from 'react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { sendFriendRequest } from '../../services/friendsService';
import { useAuth } from '../../context/AuthContext';

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
  const [requested, setRequested] = useState(false);
  const { user: currentUser } = useAuth();

  const handleAdd = async () => {
    try {
      await sendFriendRequest(user.id);
      setRequested(true);
    } catch {
      console.error('Failed to send request');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar src={user.avatarUrl} username={user.username} />
        <div>
          <p className="font-semibold text-gray-800">{user.displayName}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>
      {showAddButton && currentUser?.userId !== user.id && (
        <Button
            variant={requested ? 'secondary' : 'primary'}
            onClick={handleAdd}
            disabled={requested}>
            {requested ? 'Requested' : 'Add Friend'}
        </Button>
        )}
    </div>
  );
};

export default FriendCard;