import { useState } from 'react';

interface Props {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onChange: (file: File | null) => void;
  error?: string;
}

const FileInput = ({ label, accept = 'image/*', maxSizeMB = 5, onChange, error }: Props) => {
  const [preview, setPreview]   = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) { onChange(null); setPreview(null); return; }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFileError('Only image files are allowed');
      onChange(null);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`File must be less than ${maxSizeMB}MB`);
      onChange(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      {!preview ? (
        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
          <span className="text-gray-500 text-sm">📷 Click to upload image</span>
          <input type="file" accept={accept} onChange={handleChange} className="hidden" />
        </label>
      ) : (
        <div className="relative">
          <img src={preview} alt="preview"
            className="rounded-lg max-h-48 object-cover w-full" />
          <button type="button" onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
            ✕
          </button>
        </div>
      )}

      {(fileError || error) && (
        <span className="text-red-500 text-xs">{fileError || error}</span>
      )}
    </div>
  );
};

export default FileInput;