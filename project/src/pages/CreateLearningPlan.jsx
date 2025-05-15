import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Upload } from 'lucide-react';
import { apiService, api } from '../lib/api';

const SKILL_LEVELS = ['beginner', 'intermediate', 'pro'];

const SKILLS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'UI/UX Design',
];

export function CreateLearningPlan() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [lessons, setLessons] = useState([
    { title: '', description: '', videoId: '', documentIds: [] },
  ]);

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await apiService.uploadMedia(file);
      setThumbnail(response.id);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setError('Failed to upload thumbnail');
    }
  };

  const handleLessonChange = (index, field, value) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', description: '', videoId: '', documentIds: [] }]);
  };

  const removeLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  //upload PDF for a lesson
  const handleDocumentUpload = async (lessonIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const docId = res.id;
      const updated = [...lessons];
      updated[lessonIndex].documentIds.push(docId);
      setLessons(updated);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
    }
  };

  //remove a document from a lesson
  const removeDocument = (lessonIndex, docId) => {
    const updated = [...lessons];
    updated[lessonIndex].documentIds = updated[lessonIndex].documentIds.filter(d => d !== docId);
    setLessons(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!title.trim()) throw new Error('Title is required');
      if (!description.trim()) throw new Error('Description is required');
      if (!skill) throw new Error('Skill is required');
      if (!skillLevel) throw new Error('Skill level is required');
      if (!duration.trim()) throw new Error('Duration is required');
      if (!lessons[0].title.trim()) throw new Error('At least one lesson is required');

      const validLessons = lessons.filter(l => l.title.trim());

      const payload = {
        title: title.trim(),
        description: description.trim(),
        skill,
        skillLevel,
        duration: duration.trim(),
        thumbnail,
        lessons: validLessons,
      };

      await apiService.createLearningPlan(payload);
      navigate('/learning-plans');
    } catch (err) {
      setError(err.message || 'Failed to create learning plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Learning Plan</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-xl p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="e.g., Fullstack Web Bootcamp"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="What will learners accomplish?"
              disabled={isSubmitting}
            />
          </div>

          {/* Skill & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Category</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                disabled={isSubmitting}
              >
                <option value="">Select a skill</option>
                {SKILLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                disabled={isSubmitting}
              >
                <option value="">Select a level</option>
                {SKILL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level[0].toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="e.g., 4 weeks"
              disabled={isSubmitting}
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                id="thumbnail"
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="thumbnail"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </label>
              {thumbnail && (
                <span className="text-sm text-green-600 font-medium">Image uploaded</span>
              )}
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Lessons</h3>
              <button
                type="button"
                onClick={addLesson}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Lesson
              </button>
            </div>

            {lessons.map((lesson, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 relative">
                {lessons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Lesson title"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={lesson.description}
                    onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="What will this lesson teach?"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={lesson.videoId}
                    onChange={(e) => handleLessonChange(index, 'videoId', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  {lesson.videoId && (
                    <p className="mt-1 text-sm text-blue-600">
                      <a
                        href={lesson.videoId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View Video
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resources (PDF)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleDocumentUpload(index, e)}
                      className="hidden"
                      id={`doc-upload-${index}`}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`doc-upload-${index}`}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Add Document
                    </label>
                  </div>
                  {lesson.documentIds.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {lesson.documentIds.map((docId, docIdx) => (
                        <li key={docIdx} className="flex items-center space-x-2">
                          <a
                            href={`/api/media/${docId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Document {docIdx + 1}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeDocument(index, docId)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/learning-plans')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
