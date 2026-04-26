import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import FileInput from '../components/ui/FileInput';
import Avatar from '../components/ui/Avatar';

interface Story {
  id: number;
  imageUrl?: string;
  textContent?: string;
  createdAt: string;
  expiresAt: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

const StoriesPage = () => {
  const [stories, setStories]       = useState<Story[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [text, setText]             = useState('');
  const [image, setImage]           = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/stories');
        setStories(res.data.data);
      } catch {
        console.error('Failed to load stories');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      if (text)  formData.append('textContent', text);
      if (image) formData.append('image', image);
      const res = await api.post('/stories', formData);
      setStories(prev => [res.data.data, ...prev]);
      setShowCreate(false);
      setText('');
      setImage(null);
    } catch {
      console.error('Failed to create story');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this story?')) return;
    try {
      await api.delete(`/stories/${id}`);
      setStories(prev => prev.filter(s => s.id !== id));
      setSelectedStory(null);
    } catch {
      console.error('Failed to delete story');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Stories</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          + Add Story
        </Button>
      </div>

      {/* Create story form */}
      {showCreate && (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-gray-800">Create Story</h2>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind? (optional)"
            className="border border-gray-300 rounded-lg p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <FileInput onChange={setImage} maxSizeMB={5} label="Add Image (optional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={submitting}
              disabled={!text && !image}>
              Share Story
            </Button>
          </div>
        </div>
      )}

      {/* Stories grid */}
      {stories.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No stories yet. Share one!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stories.map(story => (
            <div key={story.id}
              onClick={() => setSelectedStory(story)}
              className="relative rounded-xl overflow-hidden cursor-pointer h-48 bg-gradient-to-br from-blue-400 to-purple-500">
              {story.imageUrl && (
                <img src={story.imageUrl} alt="story"
                  className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="flex items-center gap-2">
                  <Avatar src={story.avatarUrl} username={story.username} size="sm" />
                  <p className="text-white text-xs font-semibold truncate">
                    {story.username}
                  </p>
                </div>
                {story.textContent && (
                  <p className="text-white text-xs mt-1 truncate">{story.textContent}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story viewer modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedStory(null)}>
          <div className="relative max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}>
            <div className="bg-black rounded-xl overflow-hidden">
              {selectedStory.imageUrl && (
                <img src={selectedStory.imageUrl} alt="story"
                  className="w-full max-h-96 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={selectedStory.avatarUrl}
                    username={selectedStory.username} size="sm" />
                  <p className="text-white font-semibold">{selectedStory.username}</p>
                </div>
                {selectedStory.textContent && (
                  <p className="text-white">{selectedStory.textContent}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  Expires: {new Date(selectedStory.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="secondary" className="flex-1"
                onClick={() => setSelectedStory(null)}>
                Close
              </Button>
              <Button variant="danger" className="flex-1"
                onClick={() => handleDelete(selectedStory.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesPage;