import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import PropTypes from 'prop-types';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif'],
  video: ['video/mp4', 'video/quicktime']
};

export function MediaUpload({ onUpload, onRemove }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    const isImage = ACCEPTED_TYPES.image.includes(file.type);
    const isVideo = ACCEPTED_TYPES.video.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error('Invalid file type. Only images and videos are allowed');
    }

    if (isVideo) {
      const duration = await getVideoDuration(file);
      if (duration > 30) {
        throw new Error('Video duration exceeds 30 seconds limit');
      }
    }
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Invalid video file'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    try {
      for (const file of selectedFiles) {
        await validateFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const newFile = {
            id: Date.now().toString(),
            file,
            preview: reader.result,
            type: file.type.startsWith('image/') ? 'image' : 'video'
          };
          
          setFiles(prev => [...prev, newFile]);
          onUpload(newFile);
        };
        
        reader.readAsDataURL(file);
      }
      
      setError('');
    } catch (err) {
      setError(err.message);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onRemove(fileId);
  };

  return (
    <div className="space-y-4">
      {files.length < MAX_FILES && (
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                <span>Upload files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept={[...ACCEPTED_TYPES.image, ...ACCEPTED_TYPES.video].join(',')}
                  onChange={handleFileSelect}
                  multiple
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 50MB or MP4 videos up to 30 seconds
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div key={file.id} className="relative">
              <div className="group aspect-w-16 aspect-h-9 block w-full overflow-hidden rounded-lg bg-gray-100">
                {file.type === 'image' ? (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={file.preview}
                    controls
                    className="object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(file.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

MediaUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};