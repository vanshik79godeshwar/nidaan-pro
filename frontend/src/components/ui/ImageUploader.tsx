'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';

// Define the props to match what the PreConsultationFlow component sends
interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    setIsUploading(true);
    toast.info("Uploading file...");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      // Call the callback with the URL inside an array to match the expected type
      onUploadComplete([response.data.secure_url]);
      toast.success("File uploaded successfully!");
      setSelectedFile(null); // Reset after successful upload
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
       <div className="flex items-center gap-2">
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,application/pdf" // Accept images and PDFs
                onChange={handleFileChange}
                disabled={isUploading}
            />
             <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md inline-flex items-center"
             >
                <UploadCloud size={18} className="mr-2"/>
                {selectedFile ? 'Change file' : 'Choose a file'}
            </label>

            <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50"
            >
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
        {selectedFile && <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name}</p>}
    </div>
  );
}