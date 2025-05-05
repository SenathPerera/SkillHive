import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, Video, BookOpen, Award, Code, FileCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MediaUpload } from '../components/MediaUpload';
import apiService from '../lib/api';
import PropTypes from 'prop-types';

const PROGRESS_TEMPLATES = [
  {
    type: 'tutorial',
    icon: BookOpen,
    title: 'Tutorial Completion',
    description: 'Share tutorials you\'ve completed',
  },
  {
    type: 'skill',
    icon: Award,
    title: 'New Skills',
    description: 'List new skills you\'ve acquired',
  },
  {
    type: 'project',
    icon: Code,
    title: 'Project Update',
    description: 'Share progress on your projects',
  },
  {
    type: 'certification',
    icon: FileCheck,
    title: 'Certification',
    description: 'Share your certifications',
  },
];

export function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [postType, setPostType] = useState('skill_share');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Template-specific state
  const [completedItems, setCompletedItems] = useState([]);
  const [newSkills, setNewSkills] = useState([]);
  const [projectDetails, setProjectDetails] = useState({
    name: '',
    description: '',
    status: 'in_progress',
    githubUrl: '',
  });
  const [certificationDetails, setCertificationDetails] = useState({
    name: '',
    provider: '',
    completionDate: '',
    credentialUrl: '',
  });

  // Adds a newly uploaded media file to state
  const handleMediaUpload = (file) => {
    setMediaFiles(prev => [...prev, file]);
  };

  // Removes a media file from state by ID
  const handleMediaRemove = (fileId) => {
    setMediaFiles(prev => prev.filter(f => f.id !== fileId));
  };
// Sets the selected template type and resets title
  const handleTemplateSelect = (type) => {
    setSelectedTemplate(type);
    setTitle('');
  };
// Returns additional data depending on selected progress update template
  const getTemplateData = () => {
    if (!selectedTemplate) return undefined;

    switch (selectedTemplate) {
      case 'tutorial':
        return {
          type: 'tutorial',
          completed: completedItems,
        };
      case 'skill':
        return {
          type: 'skill',
          skillsLearned: newSkills,
        };
      case 'project':
        return {
          type: 'project',
          projectDetails,
        };
      case 'certification':
        return {
          type: 'certification',
          certificationDetails,
        };
      default:
        return undefined;
    }
  };
// Handles form submission, media upload, and post creation

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content are required');
      }

      // Upload media files first
      const uploadedMedia = await Promise.all(
        mediaFiles.map(async (file) => {
          const response = await apiService.uploadMedia(file.file, file.description);
          return {
            id: response.id,
            url: `/api/media/${response.id}`,
            type: file.type,
            description: file.description || '',
          };
        })
      );

      // Create the post with uploaded media references
      const post = {
        title: title.trim(),
        content: content.trim(),
        media: uploadedMedia,
        type: postType,
        template: getTemplateData(),
      };

      await apiService.createPost(post);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTemplateFields = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate) {
      case 'tutorial':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Completed Tutorials
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Enter tutorial name and press Enter"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target;
                      if (input.value.trim()) {
                        setCompletedItems(prev => [...prev, input.value.trim()]);
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {completedItems.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setCompletedItems(prev => prev.filter((_, i) => i !== index))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'skill':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Skills Learned
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Enter skill and press Enter"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target;
                      if (input.value.trim()) {
                        setNewSkills(prev => [...prev, input.value.trim()]);
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {newSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setNewSkills(prev => prev.filter((_, i) => i !== index))}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'project':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                value={projectDetails.name}
                onChange={(e) => setProjectDetails(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Description
              </label>
              <textarea
                value={projectDetails.description}
                onChange={(e) => setProjectDetails(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                GitHub URL (optional)
              </label>
              <input
                type="url"
                value={projectDetails.githubUrl}
                onChange={(e) => setProjectDetails(prev => ({ ...prev, githubUrl: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={projectDetails.status}
                onChange={(e) => setProjectDetails(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        );

      case 'certification':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Certification Name
              </label>
              <input
                type="text"
                value={certificationDetails.name}
                onChange={(e) => setCertificationDetails(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Provider
              </label>
              <input
                type="text"
                value={certificationDetails.provider}
                onChange={(e) => setCertificationDetails(prev => ({ ...prev, provider: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Completion Date
              </label>
              <input
                type="date"
                value={certificationDetails.completionDate}
                onChange={(e) => setCertificationDetails(prev => ({ ...prev, completionDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Credential URL (optional)
              </label>
              <input
                type="url"
                value={certificationDetails.credentialUrl}
                onChange={(e) => setCertificationDetails(prev => ({ ...prev, credentialUrl: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Post</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setPostType('skill_share');
                setSelectedTemplate(null);
              }}
              className={`px-4 py-2 rounded-md ${
                postType === 'skill_share'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Share Skills
            </button>
            <button
              type="button"
              onClick={() => setPostType('progress_update')}
              className={`px-4 py-2 rounded-md ${
                postType === 'progress_update'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Progress Update
            </button>
          </div>
        </div>

        {postType === 'progress_update' && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Choose a Template</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROGRESS_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.type}
                    type="button"
                    onClick={() => handleTemplateSelect(template.type)}
                    className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                      selectedTemplate === template.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Icon className="h-6 w-6 text-blue-600 mb-2" />
                    <h3 className="font-medium text-gray-900">{template.title}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={postType === 'skill_share' ? "What skill are you sharing?" : "What's your progress update?"}
            />
          </div>

          {renderTemplateFields()}

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={postType === 'skill_share' 
                ? "Share your knowledge and experience..."
                : "Describe your progress and what you've learned..."
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media
            </label>
            <MediaUpload
              onUpload={handleMediaUpload}
              onRemove={handleMediaRemove}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreatePost.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    full_name: PropTypes.string.isRequired,
  }),
};