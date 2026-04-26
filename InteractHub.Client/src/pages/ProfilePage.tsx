import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

interface ProfileFormData {
  displayName: string;
  bio: string;
}

const ProfilePage = () => {
  const { id }                = useParams<{ id: string }>();
  const { user: me }          = useAuth();
  const [profile, setProfile] = useState<FriendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();
  const isOwnProfile = me?.userId === id;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setProfile(res.data.data);
        reset({ displayName: res.data.data.displayName, bio: res.data.data.bio ?? '' });
      } catch {
        console.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
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
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatarUrl} username={profile.username} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{profile.displayName}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
          </div>
          {isOwnProfile && (
            <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </div>
        {isEditing && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
            <Input label="Display Name" {...register('displayName', { required: true })} />
            <Input label="Bio" {...register('bio')} />
            <Button type="submit" isLoading={isSaving}>Save Changes</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;