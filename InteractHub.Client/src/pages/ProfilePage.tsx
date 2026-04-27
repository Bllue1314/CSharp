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
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface ProfileFormData {
  displayName: string;
  bio: string;
}

const ProfilePage = () => {
  const { id }                    = useParams<{ id: string }>();
  const { user: me }              = useAuth();
  const [profile, setProfile]     = useState<ProfileUser | null>(null);
  const [posts, setPosts]         = useState<Post[]>([]);
  const [friends, setFriends]     = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [tab, setTab]             = useState<'posts' | 'friends'>('posts');

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();
  const isOwnProfile = me?.userId === id;

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        // Load profile
        const profileRes = await api.get(`/users/${id}`);
        setProfile(profileRes.data.data);
        reset({
          displayName: profileRes.data.data.displayName,
          bio: profileRes.data.data.bio ?? ''
        });

        // Load user's posts
        const postsRes = await api.get(`/posts?userId=${id}&page=1&pageSize=20`);
        setPosts(postsRes.data.data ?? []);

        // Load friends
        const friendsRes = await api.get('/friends');
        setFriends(friendsRes.data.data ?? []);

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
      const res = await api.put('/users/me', formData);
      setProfile(res.data.data);
      setIsEditing(false);
    } catch {
      console.error('Failed to update profile');
    } finally {
      setIsSaving(false);
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

          {isOwnProfile && (
            <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3 border-t pt-4">
            <Input label="Display Name" {...register('displayName', { required: true })} />
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
                onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
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
                className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <Avatar src={f.avatarUrl} username={f.username} />
                <div>
                  <p className="font-semibold text-gray-800">{f.displayName}</p>
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