import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuthStore } from '../store/authStore';

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

export function EditLearningPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const plan = await apiService.getLearningPlan(id);
        
        if (plan.userId !== user?.id) {
          navigate('/learning-plans');
          return;
        }

        setTitle(plan.title);
        setDescription(plan.description);
        setSkill(plan.skill);
        setSkillLevel(plan.skillLevel);
        setDuration(plan.duration);
        setThumbnail(plan.thumbnail);
        setLessons(plan.lessons);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch learning plan');
        console.error('Error fetching learning plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [id, user?.id, navigate]);

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiService.uploadMedia(file);
      setThumbnail(response.id);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setError('Failed to upload thumbnail');
    }
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    setLessons(updatedLessons);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', description: '', videoId: '', documentIds: [] }]);
  };

  const removeLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index));
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

      const filteredLessons = lessons.filter(lesson => lesson.title.trim());

      const learningPlan = {
        title: title.trim(),
        description: description.trim(),
        skill,
        skillLevel,
        duration: duration.trim(),
        thumbnail,
        lessons: filteredLessons,
      };

      await apiService.updateLearningPlan(id, learningPlan);
      navigate(`/learning-plans/${id}`);
    } catch (error) {
      setError(error.message || 'Failed to update learning plan');
      console.error('Error updating learning plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading learning plan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Learning Plan</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Complete Web Development Bootcamp"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what learners will achieve..."
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Category
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select a skill</option>
                {SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select a level</option>
                {SKILL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 6 weeks"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail"
                disabled={isSubmitting}
              />
              <label
                htmlFor="thumbnail"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-5 w-5 mr-2" />
                {thumbnail ? 'Change Image' : 'Choose Image'}
              </label>
              {thumbnail && (
                <span className="ml-4 text-sm text-gray-500">Image uploaded</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Lessons</h3>
              <button
                type="button"
                onClick={addLesson}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Lesson
              </button>
            </div>

            {lessons.map((lesson, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-4 relative"
              >
                {lessons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lesson title"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    value={lesson.description}
                    onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what will be covered in this lesson"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/learning-plans/${id}`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}