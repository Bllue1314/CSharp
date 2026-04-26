import { useEffect, useState } from 'react';
import { getFriends, getPendingRequests, acceptFriendRequest, removeFriend } from '../services/friendsService';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

const FriendsPage = () => {
  const [friends, setFriends]     = useState<FriendUser[]>([]);
  const [requests, setRequests]   = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab]             = useState<'friends' | 'requests'>('friends');

  useEffect(() => {
    const load = async () => {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          getFriends(),
          getPendingRequests()
        ]);
        setFriends(friendsRes.data);
        setRequests(requestsRes.data);
      } catch {
        console.error('Failed to load friends');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={tab === 'friends' ? 'primary' : 'secondary'}
          onClick={() => setTab('friends')}>
          Friends ({friends.length})
        </Button>
        <Button
          variant={tab === 'requests' ? 'primary' : 'secondary'}
          onClick={() => setTab('requests')}>
          Requests ({requests.length})
        </Button>
      </div>

      {tab === 'friends' && (
        <div className="flex flex-col gap-3">
          {friends.length === 0
            ? <p className="text-center text-gray-500">No friends yet</p>
            : friends.map(f => (
              <div key={f.id}
                className="flex items-center justify-between bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={f.avatarUrl} username={f.username} />
                  <div>
                    <p className="font-semibold text-gray-800">{f.displayName}</p>
                    <p className="text-sm text-gray-500">@{f.username}</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm(`Unfriend ${f.displayName}?`)) return;
                    try {
                      await removeFriend(parseInt(f.id));
                      setFriends(prev => prev.filter(friend => friend.id !== f.id));
                    } catch (err: any) {
                      console.error('Failed to unfriend:',
                        err.response?.status,
                        err.response?.data);
                    }
                  }}>
                  Unfriend
                </Button>
              </div>
            ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="flex flex-col gap-3">
          {requests.length === 0
            ? <p className="text-center text-gray-500">No pending requests</p>
            : requests.map(r => (
              <div key={r.id}
                className="flex items-center justify-between bg-white rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={r.avatarUrl} username={r.username} />
                  <div>
                    <p className="font-semibold text-gray-800">{r.displayName}</p>
                    <p className="text-sm text-gray-500">@{r.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={async () => {
                    try {
                      await acceptFriendRequest(parseInt(r.id));
                      setRequests(prev => prev.filter(req => req.id !== r.id));
                      setFriends(prev => [...prev, r]);
                    } catch (err: any) {
                      console.error('Failed:',
                        err.response?.status,
                        err.response?.data);
                    }
                  }}>
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      try {
                        await removeFriend(parseInt(r.id));
                        setRequests(prev => prev.filter(req => req.id !== r.id));
                      } catch (err: any) {
                        console.error('Failed:',
                          err.response?.status,
                          err.response?.data);
                      }
                    }}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;