import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createPost } from '../../services/postsService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import FileInput from '../ui/FileInput';
import Alert from '../ui/Alert';

interface FormData {
  content: string;
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

interface Props {
  onPostCreated: (post: Post) => void;
}

const CreatePostForm = ({ onPostCreated }: Props) => {
  const { user }                    = useAuth();
  const [image, setImage]           = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]       = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await createPost(data.content, image ?? undefined);
      onPostCreated(res.data);
      reset();
      setImage(null);
      setSuccess('Post created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} username={user?.username ?? 'U'} />
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-3">

          {success && <Alert type="success" message={success} />}
          {error   && <Alert type="error"   message={error}   />}

          <textarea
            {...register('content', {
              required: 'Post content is required',
              maxLength: { value: 2000, message: 'Max 2000 characters' }
            })}
            placeholder="What's on your mind?"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          {errors.content && (
            <span className="text-red-500 text-xs">{errors.content.message}</span>
          )}

          <FileInput
            onChange={setImage}
            maxSizeMB={5}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>Post</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostForm;