import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createPost } from '../../services/postsService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

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

interface FormData {
  content: string;
}

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void;
}

const CreatePostForm = ({ onPostCreated }: CreatePostFormProps) => {
  const { user } = useAuth();
  const [image, setImage]       = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const res = await createPost(data.content, image ?? undefined);
      onPostCreated(res.data);
      reset();
      setImage(null);
      setPreview(null);
    } catch {
      console.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} username={user?.username ?? 'U'} />
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-3">
          <textarea
            {...register('content', { required: 'Post content is required', maxLength: { value: 2000, message: 'Max 2000 characters' } })}
            placeholder="What's on your mind?"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          {errors.content && <span className="text-red-500 text-xs">{errors.content.message}</span>}

          {preview && (
            <div className="relative">
              <img src={preview} alt="preview" className="rounded-lg max-h-48 object-cover" />
              <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <label className="cursor-pointer text-blue-500 text-sm hover:text-blue-600">
              📷 Add Photo
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <Button type="submit" isLoading={isSubmitting}>Post</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostForm;