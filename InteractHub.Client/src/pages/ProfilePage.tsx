import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import PostCard from '../components/posts/PostCard';
import { sendFriendRequest } from '../services/friendsService';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

interface ProfileUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  postCount: number;
  friendCount: number;
}

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}

interface Friend {
  id: string;
  friendUserId?: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface ProfileFormData {
  displayName: string;
  bio: string;
}

const ProfilePage = () => {
  const { id }                        = useParams<{ id: string }>();
  const { user: me }                  = useAuth();
  const [profile, setProfile]         = useState<ProfileUser | null>(null);
  const [posts, setPosts]             = useState<Post[]>([]);
  const [friends, setFriends]         = useState<Friend[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [tab, setTab]                 = useState<'posts' | 'friends'>('posts');
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending'>('none');
  const [addingFriend, setAddingFriend] = useState(false);

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();
  const isOwnProfile = me?.userId === id;
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [avatarFile, setAvatarFile]   = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This cannot be undone!'
    );
    if (!confirmed) return;

    const doubleConfirm = confirm(
      'Last warning — your account and all data will be permanently deleted. Continue?'
    );
    if (!doubleConfirm) return;

    try {
      await api.delete('/users/me');
      logout();
      navigate('/register');
      alert('Account deleted successfully');
    } catch {
      alert('Failed to delete account');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const profileRes = await api.get(`/users/${id}`);
        setProfile(profileRes.data.data);
        reset({
          displayName: profileRes.data.data.displayName,
          bio: profileRes.data.data.bio ?? ''
        });

        const postsRes = await api.get(`/posts?userId=${id}&page=1&pageSize=20`);
        setPosts(postsRes.data.data ?? []);

        const friendsRes = await api.get('/friends');
        setFriends(friendsRes.data.data ?? []);

        // Check friendship status if not own profile
        if (me?.userId !== id) {
          const isFriend = friendsRes.data.data?.some(
            (f: Friend) => f.username === profileRes.data.data.username
          );
          if (isFriend) {
            setFriendStatus('friends');
          } else {
            // Check pending requests
            const requestsRes = await api.get('/friends/requests');
            const isPending = requestsRes.data.data?.some(
              (f: Friend) => f.username === profileRes.data.data.username
            );
            setFriendStatus(isPending ? 'pending' : 'none');
          }
        }
      } catch {
        console.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('displayName', data.displayName);
      formData.append('bio', data.bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await api.put('/users/me', formData);
      setProfile(res.data.data);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch {
      console.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFriend = async () => {
    if (!id) return;
    try {
      setAddingFriend(true);
      await sendFriendRequest(id);
      setFriendStatus('pending');
    } catch {
      console.error('Failed to send friend request');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const renderFriendButton = () => {
    if (isOwnProfile) return null;
    switch (friendStatus) {
      case 'friends':
        return <Button variant="secondary" disabled>Friends ✓</Button>;
      case 'pending':
        return <Button variant="secondary" disabled>Requested</Button>;
      default:
        return (
          <Button onClick={handleAddFriend} isLoading={addingFriend}>
            Add Friend
          </Button>
        );
    }
  };

  if (isLoading) return <Spinner />;
  if (!profile)  return <p className="text-center text-gray-500">User not found</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Profile header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatarUrl} username={profile.username} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{profile.displayName}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex gap-6 mt-3">
              <div className="text-center">
                <p className="font-bold text-gray-800">{posts.length}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800">{friends.length}</p>
                <p className="text-xs text-gray-500">Friends</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {renderFriendButton()}
            {isOwnProfile && (
              <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            )}
            {isOwnProfile && (
              <Button variant="danger" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            )}
          </div>
        </div>

        {/* Edit form */}
        {isEditing && (
          <form onSubmit={handleSubmit(onSubmit)}
            className="mt-4 flex flex-col gap-3 border-t pt-4">

            {/* Avatar upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <Avatar
                  src={avatarPreview ?? profile.avatarUrl}
                  username={profile.username}
                  size="lg"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                  Choose Photo
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                    className="text-red-400 hover:text-red-600 text-sm">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <Input label="Display Name"
              {...register('displayName', { required: true })} />
            <Input label="Bio" {...register('bio')} />
            <Button type="submit" isLoading={isSaving}>Save Changes</Button>
          </form>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'posts' ? 'primary' : 'secondary'}
          onClick={() => setTab('posts')}>
          Posts ({posts.length})
        </Button>
        <Button
          variant={tab === 'friends' ? 'primary' : 'secondary'}
          onClick={() => setTab('friends')}>
          Friends ({friends.length})
        </Button>
      </div>

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="flex flex-col gap-4">
          {posts.length === 0
            ? <p className="text-center text-gray-500 py-8">No posts yet</p>
            : posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))}
              />
            ))}
        </div>
      )}

      {/* Friends tab */}
      {tab === 'friends' && (
        <div className="flex flex-col gap-3">
          {friends.length === 0
            ? <p className="text-center text-gray-500 py-8">No friends yet</p>
            : friends.map(f => (
              <div key={f.id}
                className="bg-white rounded-xl shadow p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/profile/${f.friendUserId ?? f.id}`)}>
                <Avatar src={f.avatarUrl} username={f.username} />
                <div>
                  <p className="font-semibold text-gray-800 hover:text-blue-500">{f.displayName}</p>
                  <p className="text-sm text-gray-500">@{f.username}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;