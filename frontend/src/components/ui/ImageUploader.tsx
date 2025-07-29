// frontend/src/components/ui/ImageUploader.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    setUploading(true);
    setError('');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      onUploadSuccess(response.data.secure_url);
    } catch (err) {
      setError('Image upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
        Profile Picture
      </label>
      <div className="mt-1">
        <input
          id="image-upload"
          name="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}